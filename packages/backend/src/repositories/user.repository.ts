import {PRISMA_CLIENT} from "../../prisma";
import {User, UserRole} from "@app/shared-models/src/user.model";

export class UserRepository {
    private static instance: UserRepository | null = null;

    private constructor() {}

    public static getInstance(): UserRepository {
        if (!UserRepository.instance) {
            UserRepository.instance = new UserRepository();
        }
        return UserRepository.instance;
    }

    public async findByEmail(email: string): Promise<User | null> {
        const user = await PRISMA_CLIENT.user.findUnique({
            where: {
                email: email,
            }
        });

        return user ? {
            ...user,
            role: user.role as UserRole
        } : null;
    }

    public async findAll() : Promise<Array<User>> {
        const users = await PRISMA_CLIENT.user.findMany({});
        return users.map((user: any) => {
            return {
                ...user,
                role: user.role as UserRole
            };
        })
    }

    public async findOneById(id: number): Promise<User | null> {
        const user = await PRISMA_CLIENT.user.findUnique({
            where: {
                id: id
            }
        });

        return user ? {
            ...user,
            role: user.role as UserRole
        } : null;
    }

    public async deleteMany() {
        return PRISMA_CLIENT.user.deleteMany({});
    }

    public async count(): Promise<number> {
        return PRISMA_CLIENT.user.count();
    }

    public async createOne(userCreationData: Omit<User, "id" | "role">): Promise<User> {
        const createdUser = await PRISMA_CLIENT.user.create({
            data: {
                email: userCreationData.email,
                name: userCreationData.name,
                password: userCreationData.password,
                role: 'user' as UserRole,
            },
        });
        return {
            ...createdUser,
            role: createdUser.role as UserRole,
        }
    }
}