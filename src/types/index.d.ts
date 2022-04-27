
export declare interface Package {
    scripts: Normal,
    version: string,
    devDependencies: Normal,
    dependencies: Normal,
    path: string,
    relativePath:string
}

export declare type Normal = {
    [key: string]: string
} | null
