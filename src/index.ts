// Flatfile classes imported and used in configuration of a Workbook.
import {
  TextField,
  NumberField,
  DateField,
  OptionField,
  BooleanField,
  ReferenceField,
  ComputedField,
  Message,
  Sheet,
  Workbook,
  SpaceConfig,
  Action
} from '@flatfile/configure'

// Used in batchRecordCompute - is this necessary?
import { FlatfileRecord, FlatfileRecords } from '@flatfile/hooks'

// Example of a field created using Flatfile's makeField function
import { SmartDateField } from './SmartDateField'

// Public package that uses Google's libphonenumber 
// More at: https://www.npmjs.com/package/awesome-phonenumber?activeTab=readme
import { parsePhoneNumber } from 'awesome-phonenumber'

// Public package that converts written words to numbers
// More at: https://www.npmjs.com/package/words-to-numbers
import { wordsToNumbers } from 'words-to-numbers'

// Helper functions for null handling; could these come out of the box?
type Nil = null | undefined;
const isNull = (x: unknown): x is null => x === null;
const isUndefined = (x: unknown): x is undefined => x === undefined;
const isString = (x: unknown): x is string => typeof x === "string";
const isNil = (x: unknown): x is Nil =>
    isNull(x) || isUndefined(x) || (isString(x) && x === "");
const isNotNil = <T>(x: T | Nil): x is T => !isNil(x);

// Custom Action configured to check against students' dates of birth and ages, as imported.
// When the age limit is passed in dynamically then it uses that value, otherwise defaults to 15
// First, we check if the birthday (if provided) matches the age as entered
// Then, we check if either the birthday or the age is greater than the ageLimit
// Finally, we automatically generate a downloaded list of all the students that are greater than the ageLimit and mark those records as invalid
// const ageLimit = dynamicAgeLimit ?? 15
// const ageChecker = new Action(
//   {
//   label: "Age Checker",
//   slug: "age-checker",
//   description: "Checks all ages of students compared to current date. Adds errors to students older than the passed-in age limit."
//   },
//   async (e) => {
//     // logic here as described above
//   }
// )

/**
 * Sheets
 * Define your Sheet configuration and Fields here, or import them:
 * import { YourSheet } from './path-to-your-sheet/your-sheet.ts'
 */

const MySheet1 = new Sheet('Parents', 
{
  firstName: TextField({
    label: 'First Name',
    description: "This is a parent's first name",

    //Default is false
    required: false,

    //Default is false, what happens if this is true?
    primary: false,

    //Default is false
    unique: false,

    //Sets a default value -> does the type need to be explicitly defined?
    default: 'Unknown',

    //Which of these actually work in vX?
    // stageVisibility: {
    //   mapping: true,
    //   review: true,
    //   export: true,
    // },

    // Does this work on vX?
    // cast: (value: Any<T>) => Nullable<T>,

    // Field-level compute that trims a string if the value is not null
    compute: (value: string): string => {
      if (isNotNil(value)) {
        return value.trim()
      }
      return value
    },

    // Field level validation
    validate: (value: string): void | Message[] => {
      if (value === 'Joe') {
        throw "Joe don't work here no more"
      }
    },

    // Does this work on vX?
    // egressFormat: ((value: T) => string) | false,

    // What is this?
    // contributeToRecordCompute?: any,

    // What is this?
    // getSheetCompute?: any,

  }),

  // Passing only a string into TextField sets the label
  middleName: TextField('Middle'),

  lastName: TextField({
    label: 'Last Name',
    required: true
  }),

  email: TextField({
    label: 'Email Address',
    unique: true
  }),

  phone: TextField({
    label: 'Phone Number',
  }),

},
{
  // Does this work in vX?
  // allowCustomFields: true,

  // Does this work in vX?
  // readOnly: false,

  // Session and Logger don't work in vX
  recordCompute:  (record,session,logger) => {
    const email = record.get('email');
    const phone = record.get('phone');
    if (!email && !phone) {
      record.addError(['email','phone'],'Must include either phone or email')
    }
    if (!!phone) {
      const parsedPhone = parsePhoneNumber(JSON.stringify(phone),{regionCode:'US'});
      if (parsedPhone.valid === false) {
        record.addWarning('phone','Could not confirm as a valid phone number.')
      }
      if (parsedPhone.valid === true) {
        record.set('phone',parsedPhone.number.national)
        record.addInfo('phone','Set phone number to standard national format.')
      }
    }
  },

  // Need better examples of this. Also, fetch doesn't work right now.
  // batchRecordsCompute: async (payload: FlatfileRecords<any>) => {
  //   const response = await fetch('https://api.us.flatfile.io/health', {
  //     method: 'GET',
  //     headers: {
  //       Accept: 'application/json',
  //     },
  //   })
  //   const result = (await response.json()) as any
  //   payload.records.map(async (record: FlatfileRecord) => {
  //     record.set('fromHttp', result.info.postgres.status)
  //   })
  // },

  // Does this work in vX?
  // previewFieldKey?: ,

  // For custom actions
  // actions: {
  //   Action1,
  //   Action2
  // }
})

const MySheet2 = new Sheet('Students', 
{
  firstName: TextField({
    label: 'First Name',
    description: "This is a students's first name",
    required: true
  }),

  middleName: TextField('Middle'),

  lastName: TextField({
    label: 'Last Name',
    required: true
  }),

  // Computed field generates the whole name without requiring that name during mapping
  fullName: ComputedField(TextField({ label: "Full Name" }), {

    // What is the difference between dependsOn and possiblyDependsOn?
    dependsOn: [],
    possiblyDependsOn: ["firstName", "middleName", "lastName"],
    compute: ({ firstName, middleName, lastName }) => {
        return [firstName, middleName, lastName].reduce((acc, val) => isNotNil(val) && isString(val) ? acc + val : acc, " ");
    },
    destination: 'fullName',
  }),

  parent: ReferenceField({
    label: "Parent Email",
    sheetKey: "Parents",
    foreignKey: "email",
    relationship: "has-one",
  }),

  // Set by data hook that references another table, not shown during mapping
  phone: TextField({
    label: 'Emergency Contact Phone Number',
    stageVisibility: {
      mapping: false
    }
  }),

  // Accepting both written words for age and numbers
  // age: NumberField({
  //   label: 'Student Age',
  //   compute: (value: any): number => {
  //     if (isNotNil(value) && isString(value)) {
  //       const newValue = wordsToNumbers(value);
  //       return newValue 
  //     }
  //     return value
  //   }
  // })

  dob: SmartDateField({
    label: 'Birthday'
  }),

  type: OptionField({
    label: 'Student Type',
    required: true,

    // These are the default options, I'd like to pass in an array of overrides if available.
    options: {
      fullTime:'Full Time',
      partTime:'Part Time',
      evening:'Evening Only'
    }
  }),

  age: NumberField({
    label: 'Student Age'
  }),

},
{
  recordCompute:  (record,session,logger) => {
    const links = record.getLinks('parent')
    const phone = links[0].phone
    if (isNotNil(phone)) {
      record.set('phone',phone)
    }
    const age = record.get('age')
    const dob = record.get('dob')
    if (isNil(age) && isNil(dob)) {
      record.addError(['age','dob'],'Age or Birthday is required.')
    }
  },

  actions: {
    // ageChecker
  }
})

// Workbook  - Update to reference your Workbook with Sheet(s)
const MyWorkbook = new Workbook({
  name: 'Enrollment',
  // What is the difference between namespace and slug?
  namespace: 'my-workbook',
  slug: 'my-workbook',
  sheets: {
    MySheet1,
    MySheet2
  },
  // What are these?
  // ref: ,
  // options: ,
})

// Space Configuration - defines which Workbooks will be used in this type of Space
const MyConfig = new SpaceConfig({
  name: 'Enrollment - Full',
  // Why does this have a slug and not a namespace?
  slug: 'my-space-config',
  description: 'This is my Space Config',
  // Why not just workbooks?
  workbookConfigs: {
    MyWorkbook
  },
  // Are these just placeholders?
  // theme: ,
  // roles: ,
})

export default MyConfig
