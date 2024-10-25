/* eslint-disable no-case-declarations */
/*
Copyright 2020 Bruno Windels <bruno@windels.cloud>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {tag, text} from "../../../general/html";
import {BaseMessageView} from "./BaseMessageView.js";
import {ReplyPreviewError, ReplyPreviewView} from "./ReplyPreviewView.js";

export class TextMessageView extends BaseMessageView {
    renderMessageBody(t, vm) {
        const time = t.time({className: {hidden: !vm.time}}, vm.time);
        const container = t.div({
            className: {
                "Timeline_messageBody": true,
                statusMessage: vm => vm.shape === "message-status",
            }
        }, t.mapView(vm => vm.replyTile, replyTile => {
            if (this._isReplyPreview) {
                // if this._isReplyPreview = true, this is already a reply preview, don't nest replies for now.
                return null;
            }
            else if (vm.isReply && !replyTile) {
                return new ReplyPreviewError();
            }
            else if (replyTile) {
                return new ReplyPreviewView(replyTile, this._viewClassForTile);
            }
            else {
                return null;
            }
        }));

        // exclude comment nodes as they are used by t.map and friends for placeholders
        const shouldRemove = (element) => element?.nodeType !== Node.COMMENT_NODE && element.className !== "ReplyPreviewView";

        t.mapSideEffect(vm => vm.body, body => {
            while (shouldRemove(container.lastChild)) {
                container.removeChild(container.lastChild);
            }
            for (const part of body.parts) {
                //HACKATHON: WIP code; just experimenting
                container.appendChild(renderPart(part, vm));
            }
            container.appendChild(time);
        });

        return container;
    }
}

function renderList(listBlock) {
    const items = listBlock.items.map(item => tag.li(renderParts(item)));
    const start = listBlock.startOffset;
    if (start) {
        return tag.ol({ start }, items);
    } else {
        return tag.ul(items);
    }
}

function renderImage(imagePart) {
    const attributes = { src: imagePart.src };
    if (imagePart.width) { attributes.width = imagePart.width }
    if (imagePart.height) { attributes.height = imagePart.height }
    if (imagePart.alt) { attributes.alt = imagePart.alt }
    if (imagePart.title) { attributes.title = imagePart.title }
    return tag.img(attributes);
}

function renderPill(pillPart) {
    // The classes and structure are borrowed from avatar.js;
    // We don't call renderStaticAvatar because that would require
    // an intermediate object that has getAvatarUrl etc.
    const classes = `avatar size-12 usercolor${pillPart.avatarColorNumber}`;
    const avatar = tag.div({class: classes}, text(pillPart.avatarInitials));
    const children = renderParts(pillPart.children);
    children.unshift(avatar);
    return tag.a({class: "pill", href: pillPart.href, rel: "noopener", target: "_blank"}, children);
}

function renderTable(tablePart) {
    const children = [];
    if (tablePart.head) {
        const headers = tablePart.head
            .map(cell => tag.th(renderParts(cell)));
        children.push(tag.thead(tag.tr(headers)))
    }
    const rows = [];
    for (const row of tablePart.body) {
        const data = row.map(cell => tag.td(renderParts(cell)));
        rows.push(tag.tr(data));
    }
    children.push(tag.tbody(rows));
    return tag.table(children);
}

/**
 * Map from part to function that outputs DOM for the part
 */
const formatFunction = {
    header: headerBlock => tag["h" + Math.min(6,headerBlock.level)](renderParts(headerBlock.inlines)),
    codeblock: codeBlock => tag.pre(tag.code(text(codeBlock.text))),
    table: tableBlock => renderTable(tableBlock),
    code: codePart => tag.code(text(codePart.text)),
    text: textPart => text(textPart.text),
    //HACKATHON: WIP code; adding questionnaire format
    choice: choicePart => text(choicePart.options),
    multichoice: multiChoicePart => text(multiChoicePart.options),
    boolean: booleanPart => text(booleanPart.options),
    date: datePart => text(datePart.options),
    freetext: freeTextPart => text(freeTextPart.text),
    integer: integerPart => text(integerPart.text),
    link: linkPart => tag.a({href: linkPart.url, className: "link", target: "_blank", rel: "noopener" }, renderParts(linkPart.inlines)),
    pill: renderPill,
    format: formatPart => tag[formatPart.format](renderParts(formatPart.children)),
    rule: () => tag.hr(),
    list: renderList,
    image: renderImage,
    newline: () => tag.br()
};

//HACKATHON: WIP code; just experimenting
function renderPart(part, vm) {
    const f = formatFunction[part.type];
    if (!f) {
        return text(`[unknown part type ${part.type}]`);
    }

    //HACKATHON: WIP code; rendering reply interfaces based on Event/MessageType
    const fragment = document.createDocumentFragment();

    switch(part.type){
        case 'choice':
            fragment.appendChild(tag.br());
                for (let i = 0; i < part.options.length; i++) {
                const option = part.options[i];
                const replyButtonWrapper = document.createElement('div');
                const replyButton = document.createElement('button');
                replyButton.className = 'replyButton';
                replyButtonWrapper.className = 'replyButtonWrapper';
                replyButton.textContent = (option.replace(/^(\d{2})#/, ""));
                replyButton.addEventListener('click', () => {sendMessage(option)});
                replyButtonWrapper.appendChild(replyButton);

                fragment.appendChild(replyButtonWrapper);
                }
                return fragment;
        case 'boolean':
                fragment.appendChild(tag.br());
                const replyButtonWrapper = document.createElement('div');
                const replyButtonYes = document.createElement('button');
                const replyButtonNo = document.createElement('button');
                replyButtonYes.className = 'replyButton';
                replyButtonNo.className = 'replyButton';
                replyButtonWrapper.className = 'replyButtonWrapper';
                replyButtonYes.textContent = "Ja";
                replyButtonYes.value = "true";
                replyButtonNo.textContent = "Nein";
                replyButtonNo.value = "false";
                replyButtonYes.addEventListener('click', () => {sendMessage(replyButtonYes.value)});
                replyButtonNo.addEventListener('click', () => {sendMessage(replyButtonNo.value)});

                replyButtonWrapper.appendChild(replyButtonYes);
                replyButtonWrapper.appendChild(replyButtonNo);

                fragment.appendChild(replyButtonWrapper);
                return fragment;
        case 'date':
            fragment.appendChild(tag.br());
            const datePickerWrapper = document.createElement('div');
            const datePicker = document.createElement('input');
            datePicker.type = 'date';
            datePicker.className = 'datePicker';
            datePickerWrapper.className = 'datePickerWrapper';
            datePicker.addEventListener('change', () => {sendMessage(datePicker.value)});

            datePickerWrapper.appendChild(datePicker);

            fragment.appendChild(datePickerWrapper);
            return fragment;

        case 'multichoice':
            fragment.appendChild(tag.br());
            let selectedOptions = [];

            const checkboxWrapper = document.createElement('div');
            checkboxWrapper.className = 'checkboxWrapper';
            for (let i = 0; i < part.options.length; i++) {
                const option = part.options[i];
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'option';
                checkbox.value = option;
                checkbox.className = 'custom-checkbox';
                const label = document.createElement('label');
                label.textContent = option.replace(/^(\d{2})#/, "");
                label.htmlFor = 'option';
                label.className = 'custom-checkbox-label';
                fragment.appendChild(checkboxWrapper)
                checkboxWrapper.appendChild(checkbox);
                checkboxWrapper.appendChild(label);
            }
                        
            const confirmButton = document.createElement('button');
            confirmButton.textContent = 'bestätigen';
            confirmButton.className= 'replyButton';
            confirmButton.addEventListener('click', () => {
                selectedOptions = [];
                const parent = document.querySelector('.checkboxWrapper');
                const checkboxes = parent.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        selectedOptions.push(checkbox.value);
                    }
                });
                sendMessage(selectedOptions);
            });
            fragment.appendChild(confirmButton);
            
            return fragment;

    }
        
    return f(part);
}

//HACKATHON: WIP code - send message from reply button to msg composer

function sendMessage(message) {
    const inputElement = document.querySelector('#msg_comp');
    inputElement.value = message; 
    console.log("before");
    console.log(inputElement.innerHTML);  
    const inputButton = document.querySelector('#sendButton');
    inputButton.click();
    inputElement.innerHTML = null;
    console.log("after");
    console.log(inputElement.innerHTML);
}

function renderParts(parts) {
    return Array.from(parts, renderPart);
}
