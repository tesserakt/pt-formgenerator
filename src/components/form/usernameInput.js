import { h, Component } from 'preact';
import debounce from 'lodash/debounce';
import omit from 'lodash/omit';

import LabelInputField from './labelInputField';
import usernameValidator from './validators/username';
import Select from './select';
import bridge, { testOrigin } from '../../lib/bridge';

const COMPONENT_CLASSNAME = 'field-usernameInput';

/**
 * Call the app to ask for a network request.
 * @param  {String} 'usernameInput.request' name of the event
 */
const callBridgeUserName = bridge('usernameInput.request', ({ value }) => ({
    type: 'available',
    queryParam: { Name: value }
}));

/**
 * Inform the app about the input's state
 * @param  {String} 'usernameInput.info' name of the event
 */
const callBridgeStateInput = bridge(
    'usernameInput.info',
    ({ suggestions = [], isError, isAvailable, isLoading } = {}) => ({
        suggestions,
        isError,
        isLoading,
        isAvailable
    })
);

export default class UsernameInput extends Component {
    constructor(props) {
        super();
        this.validator = usernameValidator(props.errors);
        this.onMessage = this.onMessage.bind(this);
    }

    componentDidMount() {
        window.addEventListener('message', this.onMessage, false);
    }

    componentWillUnmount() {
        window.rempoveEventListener('message', this.onMessage, false);
    }

    onMessage({ origin, data: { type, data = {}, value } }) {
        if (!testOrigin(origin)) {
            throw new Error('Wrong targetOrigin set' + origin);
        }

        // Coming from the webapp
        if (type === 'usernameInput.query') {
            const state = this.validate(value, data);

            // Always inform the parent that we made a change
            callBridgeStateInput(state, this.props);

            // Erase old custom value if success
            this.setState({
                isAvailable: data.success,
                isLoading: false,
                // custom: data.success ? '' : this.state.custom,
                ...state
            });
        }
    }

    /**
     * Validate an input value
     *     You can pass an API response as 2sd arg to provide more informations:
     *     ({ data: Object, success: true }))
     *     -> data = Response object from api request
     * @param  {String} value Input's value
     * @param  {Object} data  API response from the app
     * @return {Object}
     */
    validate(value, data) {
        const { required, maxlength, minlength } = this.props;
        return this.validator(value, { required, maxlength, minlength, data });
    }

    onInput({ target }) {
        const value = target.value || '';
        const state = this.validate(value);

        // Reset custom value if you type something else
        if (this.state.custom !== value) {
            state.custom = '';
        }

        const totalSuggestions = ({ suggestions = [] }) => suggestions.length;
        const diffSuggestions = state.isError && totalSuggestions(this.state) !== totalSuggestions(state);

        /*
            Inform the webapp about the current state of the input.
            we resize the iframe, so if we have an error or not we need to know
            idem if we don't have the same number of suggestions ex: username taken, then remove username
         */
        if (this.state.isError !== state.isError || diffSuggestions || state.isLoading !== this.state.isLoading) {
            callBridgeStateInput(state, this.props);
        }

        this.setState(state);

        // Don't perform the validation of the username if no changes or already isError
        if (state.custom === value || state.isError) {
            return console.log('--- no change --');
        }

        const newState = { ...state, isLoading: true };
        this.setState(newState);
        callBridgeUserName({ value }, this.props);
        callBridgeStateInput(newState, this.props);
    }

    chooseSuggestion(value) {
        const state = {
            custom: value,
            isAvailable: true,
            suggestions: undefined,
            errors: [],
            classNames: [],
            isError: false,
            isLoading: false
        };
        callBridgeStateInput(state, this.props);
        this.setState(state);
    }

    render({ domains, ...props }) {
        // pattern support for :valid is 100%, minlength not supported on IE11
        const pattern = `.{${props.minlength},${props.maxlength}}`;
        return (
            <LabelInputField
                {...omit(props, ['errors', 'maxlength', 'minlength', 'api'])}
                pattern={pattern}
                value={this.state.custom || this.state.value}
                className={COMPONENT_CLASSNAME}
                classNameInput={(this.state.classNames || []).join(' ')}
                onInput={debounce(this.onInput.bind(this), 500)}
            >
                <Select {...domains} />

                {this.state.isError && (
                    <div class="error">
                        {this.state.errors.map((error) => (
                            <p>{error}</p>
                        ))}
                    </div>
                )}

                {this.state.isError && this.state.suggestions && (
                    <div class="suggestions">
                        <h4>Available usernames:</h4>
                        {this.state.suggestions.map((name) => (
                            <button type="button" onClick={() => this.chooseSuggestion(name)}>
                                {name}
                            </button>
                        ))}
                    </div>
                )}
                {this.state.isAvailable && (
                    <div class="success">
                        <p>Username available</p>
                    </div>
                )}
                {this.state.isLoading && (
                    <div className="loaderContainer info">
                        <p>Checking username </p>
                        <div class="loader">
                            <div />
                        </div>
                    </div>
                )}
            </LabelInputField>
        );
    }
}
