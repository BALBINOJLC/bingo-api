// helpers/axios-service.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { HttpStatus } from '@nestjs/common';
import { CustomError } from '@common';

export class AxiosService {
    async getRequest(url: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<any> {
        return this.sendRequest('get', url, { params, headers });
    }

    async postRequest(url: string, data?: any, headers?: Record<string, string>): Promise<any> {
        return this.sendRequest('post', url, { data, headers });
    }

    async putRequest(url: string, data?: any, headers?: Record<string, string>): Promise<any> {
        return this.sendRequest('put', url, { data, headers });
    }

    async deleteRequest(url: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<any> {
        return this.sendRequest('delete', url, { params, headers });
    }

    private async sendRequest(method: 'get' | 'post' | 'put' | 'delete', url: string, options?: AxiosRequestConfig): Promise<any> {
        try {
            const config: AxiosRequestConfig = {
                method: method,
                url: url,
                ...options,
                headers: {
                    accept: 'application/json',
                    ...(options?.headers || {}),
                },
            };

            const response: AxiosResponse = await axios(config);
            return response.data;
        } catch (error: any) {
            throw new CustomError({
                message: `ERRORS.${method.toUpperCase()}_RESOURCE`,
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                innerError: error.response?.data || error,
            });
        }
    }
}
