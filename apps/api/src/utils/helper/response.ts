import { CustomRes } from '@backend-template/http';

import { IServiceHelper } from '../types';

export const convertAndSendResponse = (data: IServiceHelper) => {
    switch (data.status) {
        case 'successful':
            return CustomRes.success(data.data, data.message)
        case 'created':
            return CustomRes.created (data.message, data.data)
        case 'forbidden':
            return CustomRes.forbidden(data.message)
        case 'deleted':
            return CustomRes.success(data.data)
        case 'not-found':
            return CustomRes.success({}, data.message)
        case 'conflict':
            return CustomRes.conflict(data.message)
        case 'bad-request':
            return CustomRes.badRequest(data.message)
        default:
            return CustomRes.serverError(data.message)
    }
}
