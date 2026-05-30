export interface LocatorStrategy {
    type: string;
    value: string;
}

export interface LocatorMetadata {
    [key: string]: any;
}

export interface LocatorRow {
    key_name: string;

    primary_locator: LocatorStrategy;

    metadata: LocatorMetadata;
}