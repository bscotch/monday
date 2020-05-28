import type { MondayItem } from "./MondayItem";
import {MondayColumnType} from "./MondayColumn";
import assert from "assert";
import {codes as countryCodes} from "./country";
import {isValidEmail,isDate} from "../util";

/** Throw error if not a string
 * @param {{[name:string]:string|void}} namedString {name:value} to allow printing the name in error messages
 * @param {boolean} [onlyRequireIfSet=false] If `true`, only require to be a string if set
 */
function requireString (namedString:{[name:string]:string|void}, onlyRequireIfSet=false){
  const names = Object.keys(namedString);
  assert(names.length==1,'Invalid namedString');
  const name = names[0];
  const string = namedString[name];
  if(string && typeof string == 'string'){
    return;
  }
  else if(typeof string == 'undefined' && onlyRequireIfSet){
    return;
  }
  throw new Error(`${name} must be a string`);
}

type CountryCode = keyof typeof countryCodes;

export interface MondayColumnValueInfo {
  id: string,
  type: string,
  value: string|null,
  title: string,
}

export class MondayColumnValue {
  private _id: string|void;
  private _item: MondayItem;
  private _type: string;
  private _title: string;
  private _value: {[field:string]:any}|null = null;

  constructor(options: MondayColumnValueInfo & {item: MondayItem}){
    this._id    = options.id;
    this._item  = options.item;
    this._type  = options.type;
    this._title = options.title;
    this.value  = options.value;
  }

  get type(){ return this._type; }
  get value(){ return this._value; }

  set value (value: string|{[field:string]:any}|null){
    if(typeof value == 'string'){
      this._value = JSON.parse(value);
    }
    else{
      this._value = value;
    }
  }

  // There are many possible ways to handle setting values. Each column type has
  // its own fields, and presumably *discovery* is not required for updating columns
  // (e.g. the entity updating the column should always know what the type is).
  // Therefore a super helpful approach for clients of this object is simply to have
  // a method per type, thus providing type information in the caller.

  setCheckbox(checked: boolean){
    this._requireType(MondayColumnType.Checkbox);
    assert(typeof checked == 'boolean','Input must be boolean');
    this.value = {checked: true};
    return this.value;
  }

  setCountry(countryCode: string){
    this._requireType(MondayColumnType.Country);
    requireString({countryCode});
    assert(countryCode.length==2,'countryCode must be 2-letter string');
    const countryName = countryCodes[countryCode as CountryCode];
    assert(countryName,'Country code not supported');
    this.value = {countryCode,countryName};
    return this.value;
  }

  setDate(date: Date){
    this._requireType(MondayColumnType.Date);
    assert(isDate(date),'Invalid date');
    // Monday requires breaking date into separate date and time components,
    // in UTC
    this.value = {
      date: `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`,
      time: `${date.getUTCHours()}-${date.getUTCMinutes()}-${date.getUTCSeconds()}`
    };
    return this.value;
  }

  /** Add tags/labels. Must already exist. */
  setDropdown(labels: string|string[]){
    this._requireType(MondayColumnType.Dropdown);
    if(!Array.isArray(labels)){
      labels = [labels];
    }
    assert(labels.length>0,'Must specify at least one label');
    assert(labels.every(label=>label && typeof label=='string'), 'Every label must be a string');
    this.value = {labels};
    return this.value;
  }

  /** Set an email and optional display text */
  setEmail(email:string, text?:string){
    this._requireType(MondayColumnType.Email);
    requireString({email});
    assert(isValidEmail(email),'Email is invalid');
    if(text){
      assert(text && typeof text == 'string','If specified, text must be a string');
    }
    const value: {email:string,text?:string} = {email};
    if(text){
      value.text = text;
    }
    this.value = value;
    return this.value;
  }

  setHour(hour: number, minute = 0){
    this._requireType(MondayColumnType.Hour);
    assert(typeof hour == 'number','Hour must be a number');
    assert(typeof minute == 'number', "Minute must be a number");
    this.value = {hour,minute};
    return this.value;
  }

  setName(name: string){
    this._requireType(MondayColumnType.Name);
    requireString({name});
    assert(name.length && name.length < 256,'Name must be 1-255 characters');
    this.value = name;
    return this.value;
  }

  setLink(url: string, text?: string){
    this._requireType(MondayColumnType.Link);
    requireString({url});
    requireString({text},true);
    const value: {url:string,text?:string} = {url};
    if(text){
      value.text = text;
    }
    this.value = value;
    return this.value;
  }

  setLongText(text:string){
    this._requireType(MondayColumnType.LongText);
    requireString({text});
    assert(text.length && text.length<=2000,'Text length must be 1-2000');
    this.value = {text};
    return this.value;
  }

  setNumber(number:number){
    this._requireType(MondayColumnType.Number);
    assert(typeof number=='number','number must be number');
    assert(isFinite(number),'number must be finite');
    this.value = `${number}`;
    return this.value;
    return this.value;
  }

  setPeople(mondayUserIds: number|number[]){
    this._requireType(MondayColumnType.People);
    mondayUserIds = Array.isArray(mondayUserIds)
      ? mondayUserIds
      : [mondayUserIds];
    assert(mondayUserIds.length>0,'Must include at least one userId');
    assert(mondayUserIds.every(userId=>typeof userId == 'number'),'UserIds must be numbers');
    this.value = {
      personsAndTeams: mondayUserIds.map(id=>{return {id,kind:'person'};})
    };
    return this.value;

  }

  setPhone(phone:string|number, countryCode='US'){
    this._requireType(MondayColumnType.Phone);
    assert(countryCodes[countryCode as CountryCode],'Country code not found');
    assert(`${phone}`.match(/^\d{10,20}$/),"Phone mumber must be digits-only string or integer");
    this.value = {phone, countryShortName:countryCode};
    return this.value;
  }

  setRating(rating: number){
    this._requireType(MondayColumnType.Rating);
    assert(typeof rating == 'number' && rating >= 1,'Rating must be number >=1');
    this.value = {rating};
    return this.value;
  }

  /** Set a status to one that already exists on the column. */
  setStatus(status: string){
    this._requireType(MondayColumnType.Status);
    requireString({status});
    this.value = {label:status};
    return this.value;
  }

  setTags(tags: string|string[]){
    this._requireType(MondayColumnType.Tags);
    tags = Array.isArray(tags) ? tags : [tags];
    assert(tags.every(tag=>tag && typeof tag == 'string'),'Tags must be strings');
    // TODO: Map tag text onto tag ids from parent board (somehow...)

    throw new Error("Need to map tag ids onto strings!");
    return this.value;
  }

  setText(text: string){
    this._requireType(MondayColumnType.Text);
    requireString({text});
    this.value = text;
    return this.value;
  }

  setTimeline(from:Date,to:Date){
    this._requireType(MondayColumnType.Timeline);
    assert(isDate(from),'Invalid from date');
    assert(isDate(to),'Invalid to date');
    assert(from<=to,"From must be before To");
    throw new Error("Timeline not yet implemented");
    // {
    //   "from": "2019-06-03",
    //   "to": "2019-06-07"
    // }
  }

  /** Set a week given a start date that falls on
   * the same day-of-week as the calendar. (If the date
   * falls on a different day of the week than the
   * start day, it will be changed to the following week)
   */
  setWeek(startDate: Date, calendarStartDay = 0){
    this._requireType(MondayColumnType.Week);
    assert(isDate(startDate),'Invalid startDate');
    throw new Error("Week not yet implemented");
    // {
    //   "week": {
    //     "startDate": "2019-06-10",
    //     "endDate": "2019-06-16"
    //   }
    // }
  }

  private _requireType(type:MondayColumnType){
    assert(this.type == type, `Column value is not type ${type}`);
  }

  get asObject(){
    return {
      id: this._id,
      type: this._type,
      title: this._title,
      value: this._value,
    };
  }
  toObject(){
    return this.asObject;
  }
}