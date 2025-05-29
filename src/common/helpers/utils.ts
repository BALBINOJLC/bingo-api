import { IDataBaseUser } from '../interfaces';

export const randonColor = (): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const userNameAndCharter = (email: string): IDataBaseUser => {
    const hash = new Date().getTime();
    const length = 13;
    const hasUser = hash.toString().substring(9, length);
    const user_name = `${email.split('@')[0].trim()}${hasUser}`;
    const Avatar = {
        name: 'no-image',
        color: randonColor(),
        charter: user_name.charAt(0).toUpperCase(),
    };

    return { Avatar, user_name };
};

export const excludePassword = (user: any): any => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};
