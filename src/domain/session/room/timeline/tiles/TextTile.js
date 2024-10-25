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

import {BaseTextTile, BodyFormat} from "./BaseTextTile.js";
import {parsePlainBody} from "../MessageBody.js";
import {parseQuestionnaire} from "../MessageBody.js";
import {parseHTMLBody} from "../deserialize.js";

export class TextTile extends BaseTextTile {
    _getContentString(key) {
        return this._getContent()?.[key] || "";
    }

    _getPlainBody() {
        return this._getContentString("body");
    }

    _getFormattedBody() {
        return this._getContentString("formatted_body");
    }

    _getBody() {
        if (this._getBodyFormat() === BodyFormat.Html) {
            return this._getFormattedBody();
        } else {
            return this._getPlainBody();
        }
    }

    _getBodyFormat() {
        if (this._getContent()?.format === "org.matrix.custom.html") {
            return BodyFormat.Html;
        } else {
            return BodyFormat.Plain;
        }
    }

    _parseBody(body, format) {
        let messageBody;
        let msgtype = this._getContent()?.msgtype;
        let type;
        console.log(msgtype)
        switch(msgtype){
            case 'm.choice':
                type = "choice";
                messageBody = parseQuestionnaire(body, type);
            break;
            case 'm.boolean':
                type = "boolean";
                messageBody = parseQuestionnaire(body, type);
            break;
            case 'm.date':
                type = "date";
                messageBody = parseQuestionnaire(body, type);
            break;
            case 'm.string':
                type = "string";
                messageBody = parseQuestionnaire(body, type);
            break;
            case 'm.integer':
                type = "integer";
                messageBody = parseQuestionnaire(body, type);
            break;
            default:
                console.log(msgtype + " results in default");
                if (format === BodyFormat.Html) {
                    messageBody = parseHTMLBody(this.platform, this._mediaRepository, body);
                } else {
                    messageBody = parsePlainBody(body);
                }
            }
        //HACKATHON: WIP code to parse questionnaire (currently "all" msg types are treated as questionnaire)


        return messageBody;
    }
}
