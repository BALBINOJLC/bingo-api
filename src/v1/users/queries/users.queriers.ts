import { Prisma } from "@prisma/client";

const FileFields = {
    id: true,
    bucket: true,
    charter: true,
    color: true,
    extension: true,
    is_public: true,
    key: true,
    mimetype: true,
    name: true,
    size: true,
    type: true,
    url: true,
};

export const queryFetchUsers: Prisma.UserSelect = {
    role: true,
    Avatar: {
        select: {
            File: {
                select: FileFields,
            },
        },
    },
};


export const queryFetchUser: Prisma.UserSelect = {
    role: true,
    Avatar: {
        select: {
            File: {
                select: FileFields,
            },
        },
    },
};