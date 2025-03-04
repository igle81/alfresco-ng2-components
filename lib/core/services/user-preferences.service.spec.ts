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

import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from '../app-config/app-config.service';
import { StorageService } from './storage.service';
import { UserPreferencesService, UserPreferenceValues } from './user-preferences.service';
import { setupTestBed } from '../testing/setupTestBed';
import { CoreTestingModule } from '../testing/core.testing.module';
import { AppConfigServiceMock } from '../mock/app-config.service.mock';

describe('UserPreferencesService', () => {

    const supportedPaginationSize = [5, 10, 15, 20];
    let preferences: UserPreferencesService;
    let storage: StorageService;
    let appConfig: AppConfigServiceMock;
    let translate: TranslateService;
    let changeDisposable: any;

    setupTestBed({
        imports: [CoreTestingModule],
        providers: [
            { provide: AppConfigService, useClass: AppConfigServiceMock }
        ]
    });

    beforeEach(() => {
        appConfig = TestBed.get(AppConfigService);
        appConfig.config = {
            pagination: {
                'size': 10,
                'supportedPageSizes': [5, 10, 15, 20]
            }
        };
        preferences = TestBed.get(UserPreferencesService);
        storage = TestBed.get(StorageService);
        translate = TestBed.get(TranslateService);
    });

    afterEach(() => {
        if (changeDisposable) {
            changeDisposable.unsubscribe();
        }
    });

    it('should get default pagination from app config', (done) => {
        appConfig.config.pagination.size = 0;
        appConfig.load().then(() => {
            expect(preferences.paginationSize).toBe(0);
            done();
        });
    });

    it('should return supported page sizes defined in the app config', () => {
        const supportedPages = preferences.supportedPageSizes;
        appConfig.load();
        expect(supportedPages).toEqual(supportedPaginationSize);
    });

    it('should use [GUEST] as default storage prefix', () => {
        preferences.setStoragePrefix(null);
        expect(preferences.getStoragePrefix()).toBe('GUEST');
    });

    it('should change storage prefix', () => {
        preferences.setStoragePrefix('USER_A');
        expect(preferences.getStoragePrefix()).toBe('USER_A');
    });

    it('should format property key for default prefix', () => {
        preferences.setStoragePrefix(null);
        expect(preferences.getPropertyKey('propertyA')).toBe('GUEST__propertyA');
    });

    it('should format property key for custom prefix', () => {
        preferences.setStoragePrefix('USER_A');
        expect(preferences.getPropertyKey('propertyA')).toBe('USER_A__propertyA');
    });

    it('should save value with default prefix', () => {
        preferences.set('propertyA', 'valueA');
        const propertyKey = preferences.getPropertyKey('propertyA');
        expect(storage.getItem(propertyKey)).toBe('valueA');
    });

    it('should null value return default prefix', () => {
        storage.setItem('paginationSize', null);
        const paginationSize = preferences.getPropertyKey('paginationSize');
        expect(preferences.get(paginationSize, 'default')).toBe('default');
    });

    it('should save value with custom prefix', () => {
        preferences.setStoragePrefix('USER_A');
        preferences.set('propertyA', 'valueA');
        const propertyKey = preferences.getPropertyKey('propertyA');
        expect(storage.getItem(propertyKey)).toBe('valueA');
    });

    it('should return as default locale the app.config locate as first', () => {
        appConfig.config.locale = 'fake-locate-config';
        spyOn(translate, 'getBrowserCultureLang').and.returnValue('fake-locate-browser');
        expect(preferences.getDefaultLocale()).toBe('fake-locate-config');
    });

    it('should return as default locale the browser locale as second', () => {
        spyOn(translate, 'getBrowserCultureLang').and.returnValue('fake-locate-browser');
        expect(preferences.getDefaultLocale()).toBe('fake-locate-browser');
    });

    it('should return as default locale the component property as third ', () => {
        spyOn(translate, 'getBrowserCultureLang').and.stub();
        expect(preferences.getDefaultLocale()).toBe('en');
    });

    it('should return as locale the store locate', () => {
        preferences.locale = 'fake-store-locate';
        appConfig.config.locale = 'fake-locate-config';
        spyOn(translate, 'getBrowserCultureLang').and.returnValue('fake-locate-browser');
        expect(preferences.locale).toBe('fake-store-locate');
    });

    it('should not store in the storage the locale if the app.config.json does not have a value', () => {
        preferences.locale = 'fake-store-locate';
        spyOn(translate, 'getBrowserCultureLang').and.returnValue('fake-locate-browser');
        expect(preferences.locale).toBe('fake-store-locate');

        expect(storage.getItem(UserPreferenceValues.Locale)).toBe(null);
    });

    it('should stream the page size value when is set', (done) => {
        preferences.paginationSize = 5;
        changeDisposable = preferences.onChange.subscribe((userPreferenceStatus) => {
            expect(userPreferenceStatus[UserPreferenceValues.PaginationSize]).toBe(5);
            done();
        });
    });

    it('should stream the user preference status when changed', (done) => {
        preferences.set('propertyA', 'valueA');
        changeDisposable = preferences.onChange.subscribe((userPreferenceStatus) => {
            expect(userPreferenceStatus.propertyA).toBe('valueA');
            done();
        });
    });
});
