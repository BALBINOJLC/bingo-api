import 'dotenv/config';
import * as Joi from 'joi';
import { IEnvVars } from './envs.interface';

const eventsShema = Joi.object({
    API_ENV: Joi.string().valid('development', 'test', 'staging', 'production').default('development'),
    API_PORT: Joi.number().required(),
    API_PREFIX: Joi.string().required(),
    API_URI: Joi.string().required(),
    CLIENT_URI: Joi.string().required(),
    JWT_KEY: Joi.string().required(),
    DATABASE_URL: Joi.string().required(),
    TWILIO_ACCOUNT_SID: Joi.string(),
    TWILIO_AUTH_TOKEN: Joi.string(),
    TWILIO_PHONE: Joi.string(),
    BV_API_KEY: Joi.string().required(),
    BV_VERIFY_ACCOUNT: Joi.string().required(),
    BV_RESET_PASSWORD: Joi.string().required(),
    AZURE_STORAGE_CONNECTION_STRING: Joi.string().required(),
    AZURE_STORAGE_KEY: Joi.string().required(),
    AZURE_STORAGE_ACCOUNT_NAME: Joi.string().required(),
    AZURE_STORAGE_CONTAINER_NAME: Joi.string().required(),
});

const { error } = eventsShema.validate(process.env, { allowUnknown: true });

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

export const envVars: IEnvVars = eventsShema.validate(process.env, {
    allowUnknown: true,
}).value as IEnvVars;
