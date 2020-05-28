export enum MondayColumnType {
  AutoNumber = 'autonumber',
  Checkbox = 'boolean',
  Date = 'date',
  Dependency = 'dependency',
  Dropdown = 'dropdown',
  Email = 'email',
  Hour = 'hour',
  ItemID = 'pulse-id',
  Link = 'link',
  LinkToItem = 'board-relation',
  LongText = 'long-text',
  Mirror = 'lookup',
  Name = "name",
  Number = 'numeric',
  Phone = 'phone',
  People = 'multiple-person',
  Status = 'color',
  Tags = 'tag',
  Text = 'text',
  Timeline = 'timerange',
  Vote = 'votes',
  ColorPicker = 'color-picker',
  Country = 'country',
  CreationLog = 'pulse-log',
  Files = 'file',
  Formula = 'formula',
  Rating = 'rating',
  Team = 'team',
  TimeTracking = 'duration',
  Week = 'week',
}

export class MondayColumn {
  private _id = "";
  private _title = "";
  private _type = "";

  constructor(options:{id:string,title:string,type:string}){
    this._id = options.id;
    this._title = options.title;
    this._type = options.type;
  }

  get id() { return this._id; }
  get title() { return this._title; }
  get type() { return this._type; }

  get asObject(){
    return {
      id: this._id,
      title: this._title,
      type: this._type,
    };
  }
  toObject(){
    return this.asObject;
  }
}