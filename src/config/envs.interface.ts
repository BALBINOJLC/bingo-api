/* eslint-disable prettier/prettier */

export enum EEnvironment {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
    STAGING = 'staging',
    TEST = 'test',
}
export interface IEnvVars {
    API_ENV: EEnvironment;
    API_PORT: string;
    API_PREFIX: string;
    API_URI: string;
    CLIENT_URI: string;
    JWT_KEY: string;
    DATABASE_URL: string;
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    TWILIO_PHONE: string;
    BV_API_KEY: string;
    BV_VERIFY_ACCOUNT: string;
    BV_RESET_PASSWORD: string;
    AZURE_STORAGE_CONNECTION_STRING: string;
    AZURE_STORAGE_KEY: string;
    AZURE_STORAGE_ACCOUNT_NAME: string;
    AZURE_STORAGE_CONTAINER_NAME: string;
}

export interface INodeEnv {
    env: IEnvVars['API_ENV'];
    port: IEnvVars['API_PORT'];
    prefix: IEnvVars['API_PREFIX'];
    api_uri: IEnvVars['API_URI'];
    client_uri: IEnvVars['CLIENT_URI'];
    db_uri: IEnvVars['DATABASE_URL'];
}

export interface ITwilioEnv {
    account_sid: IEnvVars['TWILIO_ACCOUNT_SID'];
    auth_token: IEnvVars['TWILIO_AUTH_TOKEN'];
    twilio_phone: IEnvVars['TWILIO_PHONE'];
}

export interface IBrevoEnv {
    api_key: IEnvVars['BV_API_KEY'];
    templates: IBrevoTemplates;
}

export interface IAzureEnv {
    blobs: IAzureBlobsEnv;
}

export interface IAzureBlobsEnv {
    connectionString: IEnvVars['AZURE_STORAGE_CONNECTION_STRING'];
    key: IEnvVars['AZURE_STORAGE_KEY'];
    accountName: IEnvVars['AZURE_STORAGE_ACCOUNT_NAME'];
    containerName: IEnvVars['AZURE_STORAGE_CONTAINER_NAME'];
}

export interface IBrevoTemplates {
    auth: IBrevoTemplatesAuth;
}

export interface IBrevoTemplatesAuth {
    verify_account: IEnvVars['BV_VERIFY_ACCOUNT'];
    reset_password: IEnvVars['BV_RESET_PASSWORD'];
}

export interface IJwtEnv {
    jxt_key: IEnvVars['JWT_KEY'];
}

export interface IEnvs {
    node: INodeEnv;
    jwt: IJwtEnv;
    twilio: ITwilioEnv;
    brevo: IBrevoEnv;
}
