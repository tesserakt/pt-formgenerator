import { h, render } from 'preact';

function select({ label, children, options = [], ...attributes }) {
    return (
        <div class="field field-select">
            <label for={name}>{label}</label>
            <select {...attributes} id={attributes.name}>
                {options.map(({ label, ...option }) => (
                    <option {...option}>{label || option.value}</option>
                ))}
            </select>
            {children}
        </div>
    );
}

export default select;
