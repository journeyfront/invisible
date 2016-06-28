// models

interface Query {
  [propName: string]: any;
}
interface QueryOptions {
  limit: number;
  skip: number;
  sort: Array<string[]> | string;
}
interface InvisibleModel {
  // properties
  validations?: {
    methods: string[],
    [propName: string]: any
  };
  // callbacks
  save(callback: (err: Error, res: InvisibleModel) => void);
  delete(callback: (err: Error, res: InvisibleModel) => void);
  findById(id: string, callback: (err: Error, res: InvisibleModel) => void);
  query(callback: (err: Error, res: InvisibleModel[]) => void);
  query(query: Query, callback: (err: Error, res: InvisibleModel[]) => void);
  query(query: Query, queryOptions: QueryOptions, callback: (err: Error, res: InvisibleModel[]) => void);
}

declare namespace Invisible {
  export function createModel(name: string, obj: any): InvisibleModel;
  export var models: { [propname: string]: InvisibleModel };

}

declare module "Invisible" {
  export = Invisible;
}
