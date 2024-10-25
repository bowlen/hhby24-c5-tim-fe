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

import {TemplateView} from "../general/TemplateView";
import {hydrogenGithubLink} from "./common.js";
import {PasswordLoginView} from "./PasswordLoginView.js";
import {CompleteSSOView} from "./CompleteSSOView.js";
import {SessionLoadStatusView} from "./SessionLoadStatusView.js";
import {spinner} from "../common.js";
import "../css/login.css";

export class LoginView extends TemplateView {
    render(t, vm) {
        const disabled = vm => vm.isBusy;

        return t.div({className: "PreSessionScreen"}, [
            /*t.button({
                className: "button-utility LoginView_back",
                onClick: () => vm.goBack(),
                disabled
            }),*/
            t.div({ className: "LoginView_header" }, [ 
                t.h1([vm.i18n`Anmelden`])
            ]),
            t.h3([vm.i18n`Geben Sie Ihre GesundheitsID-Pin ein.`]),
            t.mapView(vm => vm.completeSSOLoginViewModel, vm => vm ? new CompleteSSOView(vm) : null),
            t.if(vm => vm.isFetchingLoginOptions, t => t.div({className: "LoginView_query-spinner"}, [spinner(t), t.p("Fetching available login options...")])),
            t.mapView(vm => vm.passwordLoginViewModel, vm => vm ? new PasswordLoginView(vm): null),
            t.mapView(vm => vm.loadViewModel, loadViewModel => loadViewModel ? new SessionLoadStatusView(loadViewModel) : null),
            // use t.mapView rather than t.if to create a new view when the view model changes too
        ]);
    }
}

class StartSSOLoginView extends TemplateView {
    render(t, vm) {
        return t.div({ className: "StartSSOLoginView" },
            t.button({
                className: "StartSSOLoginView_button button-action secondary",
                type: "button",
                onClick: () => vm.startSSOLogin(),
                disabled: vm => vm.isBusy
            }, vm.i18n`Log in with SSO`)
        );
    }
}
