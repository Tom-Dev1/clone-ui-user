export enum UserType {
    EMPLOYEE = "EMPLOYEE",
    AGENCY = "AGENCY"
}
export enum DeparmentType {
    WAREHOUSE = "WAREHOUSE MANAGER",
    SALES = "SALES MANAGER"
}
export interface RegisterRequest {
    username: string;
    email: string;
    phone: string;
    userType: UserType;
    fullName: string;
    position: string;
    department: string;
    agencyName: string;
    street: string;
    wardName: string;
    districtName: string;
    provinceName: string;
    createdAt: string;
}

export enum UserRole {
    SALES_MANAGER = "4",
    AGENCY = "2",
}

export interface UserInfo {
    id: string
    username: string
    email: string
    role: string
    roleName?: string
    exp?: number

}

export interface TokenResponse {
    token: {
        roleName: string
        token: string
    }
}


export interface User {
    userId: string
    userName: string
    password: string
    email: string
    userType: UserType
    phone: string
    status: boolean
    verifyEmail: boolean
}