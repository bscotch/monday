

declare interface MondayServerSdkResponse {
  data: {
    /** Included upon creation of an item */
    create_item?: {id: string|number},
    users: any[],
    boards: any[],
    /** Values depend on the endpoint */
    [field: string]: any,
  },
  account_id: number
}

declare module "monday-sdk-js" {

  class MondayServerSdk {
    setToken(token: string): void;
    api(query: string): Promise<MondayServerSdkResponse>;
  }
  function mondaySDK(): MondayServerSdk;
  export = mondaySDK;
}
