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

import { async, TestBed } from '@angular/core/testing';
import { setupTestBed, IdentityUserService, IdentityUserModel, AlfrescoApiServiceMock } from '@alfresco/adf-core';
import { LogService, AppConfigService, StorageService, CoreModule } from '@alfresco/adf-core';
import { TaskCloudService } from './task-cloud.service';
import { taskDetailsCloudMock } from '../mocks/task-details-cloud.mock';
import { taskCompleteCloudMock } from '../mocks/fake-complete-task.mock';
import { fakeTaskDetailsCloud } from '../mocks/fake-task-details-response.mock';

describe('Task Cloud Service', () => {

    let service: TaskCloudService;
    let alfrescoApiMock: AlfrescoApiServiceMock;
    let identityService: IdentityUserService;
    let identityUserWithOutFirstNameMock = { firstName: null, lastName: 'fake-identity-last-name', email: 'fakeIdentity@email.com', username: 'superadminuser' };
    let getCurrentUserInfoStub;
    let fakeIdentityUser: IdentityUserModel = new IdentityUserModel(identityUserWithOutFirstNameMock);

    function returnFakeTaskCompleteResults() {
        return {
            oauth2Auth: {
                callCustomApi : () => {
                    return Promise.resolve(taskCompleteCloudMock);
                }
            }
        };
    }

    function returnFakeTaskCompleteResultsError() {
        return {
            oauth2Auth: {
                callCustomApi : () => {
                    return Promise.reject(taskCompleteCloudMock);
                }
            }
        };
    }

    function returnFakeTaskDetailsResults() {
        return {
            oauth2Auth: {
                callCustomApi : () => {
                    return Promise.resolve(fakeTaskDetailsCloud);
                }
            }
        };
    }

    setupTestBed({
        imports: [
            CoreModule.forRoot()
        ],
        providers: [IdentityUserService, LogService]
    });

    beforeEach(async(() => {

        identityService = TestBed.get(IdentityUserService);
        getCurrentUserInfoStub = spyOn(identityService, 'getCurrentUserInfo');
        getCurrentUserInfoStub.and.returnValue(fakeIdentityUser);
        alfrescoApiMock = new AlfrescoApiServiceMock(new AppConfigService(null), new StorageService() );
        service = new TaskCloudService(alfrescoApiMock,
                                           new AppConfigService(null),
                                           new LogService(new AppConfigService(null)),
                                           identityService);

    }));

    it('should complete a task', (done) => {
        const appName = 'simple-app';
        const taskId = '68d54a8f';
        spyOn(alfrescoApiMock, 'getInstance').and.callFake(returnFakeTaskCompleteResults);
        service.completeTask(appName, taskId).subscribe((res: any) => {
            expect(res).toBeDefined();
            expect(res).not.toBeNull();
            expect(res.entry.appName).toBe('simple-app');
            expect(res.entry.id).toBe('68d54a8f');
            done();
        });
    });

    it('should not complete a task', (done) => {
        spyOn(alfrescoApiMock, 'getInstance').and.callFake(returnFakeTaskCompleteResultsError);
        const appName = 'simple-app';
        const taskId = '68d54a8f';

        service.completeTask(appName, taskId).toPromise().then( (res: any) => {
        }, (error) => {
            expect(error).toBeDefined();
            done();
        });
    });

    it('should canCompleteTask', () => {
        const canCompleteTaskResult = service.canCompleteTask(taskDetailsCloudMock);
        expect(canCompleteTaskResult).toBe(true);
    });

    it('should return the task details when querying by id', (done) => {
        const appName = 'taskp-app';
        const taskId = '68d54a8f';
        spyOn(alfrescoApiMock, 'getInstance').and.callFake(returnFakeTaskDetailsResults);
        service.getTaskById(appName, taskId).subscribe((res: any) => {
            expect(res).toBeDefined();
            expect(res).not.toBeNull();
            expect(res.appName).toBe('task-app');
            expect(res.id).toBe('68d54a8f');
            done();
        });
    });

    it('should throw error if appName is not defined when querying by id', (done) => {
        const appName = null;
        const taskId = '68d54a8f';
        spyOn(alfrescoApiMock, 'getInstance').and.callFake(returnFakeTaskDetailsResults);
        service.getTaskById(appName, taskId).subscribe(
            () => { },
            (error) => {
                expect(error).toBe('AppName/TaskId not configured');
                done();
            });
    });

    it('should throw error if taskId is not defined when querying by id', (done) => {
        const appName = 'task-app';
        const taskId = null;
        spyOn(alfrescoApiMock, 'getInstance').and.callFake(returnFakeTaskDetailsResults);
        service.getTaskById(appName, taskId).subscribe(
            () => { },
            (error) => {
                expect(error).toBe('AppName/TaskId not configured');
                done();
            });
    });

    it('should return the task details when updating a task', (done) => {
        const appName = 'taskp-app';
        const taskId = '68d54a8f';
        const updatePayload = { description: 'New description' };
        spyOn(alfrescoApiMock, 'getInstance').and.callFake(returnFakeTaskDetailsResults);
        service.updateTask(appName, taskId, updatePayload).subscribe((res: any) => {
            expect(res).toBeDefined();
            expect(res).not.toBeNull();
            expect(res.appName).toBe('task-app');
            expect(res.id).toBe('68d54a8f');
            done();
        });
    });

    it('should throw error if appName is not defined when updating a task', (done) => {
        const appName = null;
        const taskId = '68d54a8f';
        const updatePayload = { description: 'New description' };
        spyOn(alfrescoApiMock, 'getInstance').and.callFake(returnFakeTaskDetailsResults);
        service.updateTask(appName, taskId, updatePayload).subscribe(
            () => { },
            (error) => {
                expect(error).toBe('AppName/TaskId not configured');
                done();
            });
    });

    it('should throw error if taskId is not defined when updating a task', (done) => {
        const appName = 'task-app';
        const taskId = null;
        const updatePayload = { description: 'New description' };
        spyOn(alfrescoApiMock, 'getInstance').and.callFake(returnFakeTaskDetailsResults);
        service.updateTask(appName, taskId, updatePayload).subscribe(
            () => { },
            (error) => {
                expect(error).toBe('AppName/TaskId not configured');
                done();
            });
    });

    it('should return the task details when updating a task', (done) => {
        const appName = 'taskp-app';
        const taskId = '68d54a8f';
        const updatePayload = { description: 'New description' };
        spyOn(alfrescoApiMock, 'getInstance').and.callFake(returnFakeTaskDetailsResults);
        service.updateTask(appName, taskId, updatePayload).subscribe((res: any) => {
            expect(res).toBeDefined();
            expect(res).not.toBeNull();
            expect(res.appName).toBe('task-app');
            expect(res.id).toBe('68d54a8f');
            done();
        });
    });

    it('should throw error if appName is not defined when querying by id', (done) => {
        const appName = null;
        const taskId = '68d54a8f';
        const updatePayload = { description: 'New description' };
        spyOn(alfrescoApiMock, 'getInstance').and.callFake(returnFakeTaskDetailsResults);
        service.updateTask(appName, taskId, updatePayload).subscribe(
            () => { },
            (error) => {
                expect(error).toBe('AppName/TaskId not configured');
                done();
            });
    });

    it('should throw error if taskId is not defined updating a task', (done) => {
        const appName = 'task-app';
        const taskId = null;
        const updatePayload = { description: 'New description' };
        spyOn(alfrescoApiMock, 'getInstance').and.callFake(returnFakeTaskDetailsResults);
        service.updateTask(appName, taskId, updatePayload).subscribe(
            () => { },
            (error) => {
                expect(error).toBe('AppName/TaskId not configured');
                done();
            });
    });

    it('should return the task details when claiming a task', (done) => {
        const appName = 'taskp-app';
        const assignee = 'user12';
        const taskId = '68d54a8f';
        spyOn(alfrescoApiMock, 'getInstance').and.callFake(returnFakeTaskDetailsResults);
        service.claimTask(appName, taskId, assignee).subscribe((res: any) => {
            expect(res).toBeDefined();
            expect(res).not.toBeNull();
            expect(res.appName).toBe('task-app');
            expect(res.id).toBe('68d54a8f');
            done();
        });
    });

    it('should throw error if appName is not defined when claiming a task', (done) => {
        const appName = null;
        const taskId = '68d54a8f';
        const assignee = 'user12';
        spyOn(alfrescoApiMock, 'getInstance').and.callFake(returnFakeTaskDetailsResults);
        service.claimTask(appName, taskId, assignee).subscribe(
            () => { },
            (error) => {
                expect(error).toBe('AppName/TaskId not configured');
                done();
            });
    });

    it('should throw error if taskId is not defined when claiming a task', (done) => {
        const appName = 'task-app';
        const taskId = null;
        const assignee = 'user12';
        spyOn(alfrescoApiMock, 'getInstance').and.callFake(returnFakeTaskDetailsResults);
        service.claimTask(appName, taskId, assignee).subscribe(
            () => { },
            (error) => {
                expect(error).toBe('AppName/TaskId not configured');
                done();
            });
    });

    it('should return the task details when unclaiming a task', (done) => {
        const appName = 'taskp-app';
        const taskId = '68d54a8f';
        spyOn(alfrescoApiMock, 'getInstance').and.callFake(returnFakeTaskDetailsResults);
        service.unclaimTask(appName, taskId).subscribe((res: any) => {
            expect(res).toBeDefined();
            expect(res).not.toBeNull();
            expect(res.appName).toBe('task-app');
            expect(res.id).toBe('68d54a8f');
            done();
        });
    });

    it('should throw error if appName is not defined when unclaiming a task', (done) => {
        const appName = null;
        const taskId = '68d54a8f';
        spyOn(alfrescoApiMock, 'getInstance').and.callFake(returnFakeTaskDetailsResults);
        service.unclaimTask(appName, taskId).subscribe(
            () => { },
            (error) => {
                expect(error).toBe('AppName/TaskId not configured');
                done();
            });
    });

    it('should throw error if taskId is not defined when unclaiming a task', (done) => {
        const appName = 'task-app';
        const taskId = null;
        spyOn(alfrescoApiMock, 'getInstance').and.callFake(returnFakeTaskDetailsResults);
        service.unclaimTask(appName, taskId).subscribe(
            () => { },
            (error) => {
                expect(error).toBe('AppName/TaskId not configured');
                done();
            });
    });
});
