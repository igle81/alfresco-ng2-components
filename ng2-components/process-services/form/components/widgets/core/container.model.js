"use strict";
/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var form_widget_model_1 = require("./form-widget.model");
var ContainerModel = (function (_super) {
    __extends(ContainerModel, _super);
    function ContainerModel(field) {
        var _this = this;
        if (field) {
            _this = _super.call(this, field.form, field.json) || this;
            _this.field = field;
        }
        return _this;
    }
    Object.defineProperty(ContainerModel.prototype, "isVisible", {
        get: function () {
            return this.field.isVisible;
        },
        enumerable: true,
        configurable: true
    });
    return ContainerModel;
}(form_widget_model_1.FormWidgetModel));
exports.ContainerModel = ContainerModel;