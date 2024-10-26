/*
Copyright 2021 The Matrix.org Foundation C.I.C.

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

import {TemplateView} from "../general/TemplateView";
import "../css/login.css"
import { classNames } from "../general/html";
import "bootstrap-icons/font/bootstrap-icons.css";

export class PasswordLoginView extends TemplateView {
    render(t, vm) {
        const disabled = vm => !!vm.isBusy;
        const password = t.input({
            id: "password",
            type: "password",
            placeholder: vm.i18n`GesundheitsID-PIN`,
            style: "flex: 1;",
            disabled
        });
        const eyeIcon = t.span({
            className: "bi bi-eye-slash",
            style: "cursor: default;",
        })
        
        return t.div({className: "PasswordLoginView form"}, [
            t.if(vm => vm.error, t => t.div({ className: "error" }, vm => vm.error)),
            t.form({
                onSubmit: evnt => {
                    evnt.preventDefault();
                    vm.login("peterfrickenberger", "tim-peter123");
                }
            }, [
                t.if(vm => vm.errorMessage, (t, vm) => t.p({className: "error"}, vm.i18n(vm.errorMessage))),
                t.div({ className: "form-row" }, [
                    t.label({ for: "password" }),
                    t.div({ className: "input-wrapper" }, [
                        password,
                        eyeIcon, // Add the static closed eye icon next to the password input
                    ]),
                ]),
                t.div({ className: "button-container" }, [ // Add a wrapping div
                    t.button({
                        className: "button-login",
                        type: "submit",
                        disabled
                    }, vm.i18n`Anmelden`),
                ]),
                
            ])
        ]);
    }
}

