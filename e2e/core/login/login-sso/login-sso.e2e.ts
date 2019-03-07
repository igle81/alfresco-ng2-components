/*!
 * @license
 * Copyright 2019 Alfresco Software, Ltd.
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

import { LoginSSOPage } from '@alfresco/adf-testing';
import { SettingsPage } from '../../../pages/adf/settingsPage';
import TestConfig = require('../../../test.config');
import { browser } from 'protractor';
import { NavigationBarPage } from '../../../pages/adf/navigationBarPage';
import { LoginPage } from '../../../pages/adf/loginPage';

describe('Login component - SSO', () => {

    const settingsPage = new SettingsPage();
    const loginApsPage = new LoginSSOPage();
    const loginPage = new LoginPage();
    const navigationBarPage = new NavigationBarPage();
    let silentLogin, implicitFlow;

    afterEach(() => {
        navigationBarPage.clickLogoutButton();
        browser.executeScript('window.sessionStorage.clear();');
        browser.executeScript('window.localStorage.clear();');
    });

    it('[C261050] Should be possible login in the PS with SSO', () => {
        silentLogin = false;
        settingsPage.setProviderBpmSso(TestConfig.adf.hostBPM, TestConfig.adf.hostSso, TestConfig.adf.hostIdentity, silentLogin);
        loginApsPage.clickOnSSOButton();
        loginApsPage.loginAPS(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
    });

    it('[C280667] Should be redirect directly to keycloak without show the login page with silent login', () => {
        settingsPage.setProviderBpmSso(TestConfig.adf.hostBPM, TestConfig.adf.hostSso, TestConfig.adf.hostIdentity);
        loginApsPage.loginAPS(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
    });

    it('[C299158] Should be possible to login to BPM with SSO, with Implicit Flow false and Silent Login false', () => {
        silentLogin = false;
        implicitFlow = false;
        settingsPage.setProviderBpmSso(TestConfig.adf.hostBPM, TestConfig.adf.hostSso, TestConfig.adf.hostIdentity, silentLogin, implicitFlow);
        loginPage.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
    });

    it('[C299159] Should be possible to login to BPM with SSO, with Implicit Flow false and Silent Login true', () => {
        silentLogin = true;
        implicitFlow = false;
        settingsPage.setProviderBpmSso(TestConfig.adf.hostBPM, TestConfig.adf.hostSso, TestConfig.adf.hostIdentity, silentLogin, implicitFlow);
        loginPage.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);
    });
});
