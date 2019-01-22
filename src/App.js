import { h, Component } from 'preact';

import LabelInputField from './components/form/labelInputField';
import UsernameInput from './components/form/usernameInput';
import Select from './components/form/select';
// import './App.css';

export default class App extends Component {
    render({ config }) {
        return (
            <div>
                {config.map(({ component, ...input }) => {
                    if (component === 'username') {
                        return <UsernameInput {...input} />;
                    }
                    if (component === 'domains') {
                        return <Select {...input} />;
                    }
                    return <LabelInputField {...input} />;
                })}
            </div>
        );
    }
}

/*
submit({ target }) {
    const data = new FormData(target);
    for (const item of data.entries()) {
        console.log(item);
    }
}
<div>
          <form name="dew" onsubmit={(e) => (e.preventDefault(), this.submit(e))} novalidate>
              {config.map(({ component, ...input }) => {
                  if (component === 'username') {
                      return <UsernameInput {...input} />;
                  }
                  if (component === 'domains') {
                      return <Select {...input} />;
                  }
                  return <LabelInputField {...input} />;
              })}

              <button>Send</button>
          </form>
      </div>

 */
