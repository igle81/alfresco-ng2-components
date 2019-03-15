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

import { LoginPage } from '../pages/adf/loginPage';
import { ContentServicesPage } from '../pages/adf/contentServicesPage';
import { InfinitePaginationPage } from '../pages/adf/core/infinitePaginationPage';
import { ConfigEditorPage } from '../pages/adf/configEditorPage';
import { NavigationBarPage } from '../pages/adf/navigationBarPage';

import { AcsUserModel } from '../models/ACS/acsUserModel';
import { FolderModel } from '../models/ACS/folderModel';

import TestConfig = require('../test.config');
import { Util } from '../util/util';

import AlfrescoApi = require('alfresco-js-api-node');
import { UploadActions } from '../actions/ACS/upload.actions';

describe('Enable infinite scrolling', () => {

    const loginPage = new LoginPage();
    const contentServicesPage = new ContentServicesPage();
    const infinitePaginationPage = new InfinitePaginationPage();
    const configEditorPage = new ConfigEditorPage();
    const navigationBarPage = new NavigationBarPage();

    let acsUser = new AcsUserModel();
    let folderModel = new FolderModel({ 'name': 'folderOne' });

    let fileNames = [], nrOfFiles = 30;
    let fileNum = 0, pageSize = 20;
    let emptyFolderModel;

    let files = {
        base: 'newFile',
        extension: '.txt'
    };

    beforeAll(async (done) => {
        let uploadActions = new UploadActions();

        this.alfrescoJsApi = new AlfrescoApi({
            provider: 'ECM',
            hostEcm: TestConfig.adf.url
        });

        await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);

        await this.alfrescoJsApi.core.peopleApi.addPerson(acsUser);

        loginPage.loginToContentServicesUsingUserModel(acsUser);

        navigationBarPage.clickContentServicesButton();
        contentServicesPage.checkAcsContainer();

        fileNames = Util.generateSequenceFiles(1, nrOfFiles, files.base, files.extension);

        await this.alfrescoJsApi.login(acsUser.id, acsUser.password);

        let folderUploadedModel = await uploadActions.createFolder(this.alfrescoJsApi, folderModel.name, '-my-');
        emptyFolderModel = await uploadActions.createFolder(this.alfrescoJsApi, 'emptyFolder', '-my-');

        await uploadActions.createEmptyFiles(this.alfrescoJsApi, fileNames, folderUploadedModel.entry.id);

        done();
    });

    it('[C260484] Should be possible to enable infinite scrolling', () => {
        contentServicesPage.doubleClickRow(folderModel.name);
        contentServicesPage.enableInfiniteScrolling();
        infinitePaginationPage.clickLoadMoreButton();
        for (fileNum; fileNum < nrOfFiles; fileNum++) {
            contentServicesPage.checkContentIsDisplayed(fileNames[fileNum]);
        }
    });

    it('[C299201] Should use default pagination settings for infinite pagination', () => {
        navigationBarPage.clickContentServicesButton();
        contentServicesPage.checkAcsContainer();
        contentServicesPage.doubleClickRow(folderModel.name);

        contentServicesPage.enableInfiniteScrolling();
        expect(contentServicesPage.numberOfResultsDisplayed()).toBe(pageSize);
        infinitePaginationPage.clickLoadMoreButton();
        expect(contentServicesPage.numberOfResultsDisplayed()).toBe(nrOfFiles);

        infinitePaginationPage.checkLoadMoreButtonIsNotDisplayed();
        contentServicesPage.checkPaginationIsNotDisplayed();
    });

    it('[C299202] Should not display load more button when all the files are already displayed', () => {
        navigationBarPage.clickConfigEditorButton();
        configEditorPage.clickInfinitePaginationConfiguration();
        configEditorPage.clickClearButton();
        configEditorPage.enterConfiguration('30');
        configEditorPage.clickSaveButton();

        navigationBarPage.clickContentServicesButton();
        contentServicesPage.checkAcsContainer();
        contentServicesPage.doubleClickRow(folderModel.name);

        contentServicesPage.enableInfiniteScrolling();
        expect(contentServicesPage.numberOfResultsDisplayed()).toBe(nrOfFiles);

        infinitePaginationPage.checkLoadMoreButtonIsNotDisplayed();
    });

    it('[C299203] Should not display load more button when a folder is empty', () => {
        navigationBarPage.clickContentServicesButton();
        contentServicesPage.checkAcsContainer();

        contentServicesPage.doubleClickRow(emptyFolderModel.entry.name);

        infinitePaginationPage.checkLoadMoreButtonIsNotDisplayed();
    });
});
