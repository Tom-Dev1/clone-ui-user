export interface AgencyLevel {
    levelId: number
    levelName: string
    discountPercentage: number
    creditLimit: number
    paymentTerm: number
}

export interface NewAgencyLevel {
    levelName: string
    discountPercentage: number
    creditLimit: number
    paymentTerm: number
}
