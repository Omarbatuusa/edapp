/**
 * Seed data for all new dictionary tables.
 * Each entry has: code, label, sort_order.
 */

export const SEED_DATA: Record<string, Array<{ code: string; label: string; sort_order: number }>> = {
    dict_genders: [
        { code: 'MALE', label: 'Male', sort_order: 1 },
        { code: 'FEMALE', label: 'Female', sort_order: 2 },
        { code: 'NON_BINARY', label: 'Non-Binary', sort_order: 3 },
        { code: 'PREFER_NOT_TO_SAY', label: 'Prefer Not to Say', sort_order: 4 },
    ],

    dict_races: [
        { code: 'BLACK', label: 'Black African', sort_order: 1 },
        { code: 'COLOURED', label: 'Coloured', sort_order: 2 },
        { code: 'INDIAN', label: 'Indian / Asian', sort_order: 3 },
        { code: 'WHITE', label: 'White', sort_order: 4 },
        { code: 'OTHER', label: 'Other', sort_order: 5 },
    ],

    dict_countries: [
        { code: 'ZA', label: 'South Africa', sort_order: 1 },
        { code: 'ZW', label: 'Zimbabwe', sort_order: 2 },
        { code: 'MZ', label: 'Mozambique', sort_order: 3 },
        { code: 'NA', label: 'Namibia', sort_order: 4 },
        { code: 'BW', label: 'Botswana', sort_order: 5 },
        { code: 'LS', label: 'Lesotho', sort_order: 6 },
        { code: 'SZ', label: 'Eswatini', sort_order: 7 },
        { code: 'NG', label: 'Nigeria', sort_order: 8 },
        { code: 'GH', label: 'Ghana', sort_order: 9 },
        { code: 'KE', label: 'Kenya', sort_order: 10 },
        { code: 'UG', label: 'Uganda', sort_order: 11 },
        { code: 'CD', label: 'DR Congo', sort_order: 12 },
        { code: 'TZ', label: 'Tanzania', sort_order: 13 },
        { code: 'MW', label: 'Malawi', sort_order: 14 },
        { code: 'ZM', label: 'Zambia', sort_order: 15 },
        { code: 'AO', label: 'Angola', sort_order: 16 },
        { code: 'ET', label: 'Ethiopia', sort_order: 17 },
        { code: 'GB', label: 'United Kingdom', sort_order: 18 },
        { code: 'US', label: 'United States', sort_order: 19 },
        { code: 'IN', label: 'India', sort_order: 20 },
        { code: 'OTHER', label: 'Other', sort_order: 99 },
    ],

    dict_permit_types: [
        { code: 'WORK', label: 'Work Permit', sort_order: 1 },
        { code: 'STUDY', label: 'Study Permit', sort_order: 2 },
        { code: 'TEMPORARY_RESIDENCE', label: 'Temporary Residence', sort_order: 3 },
        { code: 'PERMANENT_RESIDENCE', label: 'Permanent Residence', sort_order: 4 },
        { code: 'REFUGEE', label: 'Refugee Status', sort_order: 5 },
        { code: 'ASYLUM', label: 'Asylum Seeker', sort_order: 6 },
        { code: 'SPOUSAL', label: 'Spousal Visa', sort_order: 7 },
        { code: 'OTHER', label: 'Other', sort_order: 99 },
    ],

    dict_typical_ages: [
        { code: 'AGE_5', label: 'Age 5 (Grade R)', sort_order: 1 },
        { code: 'AGE_6', label: 'Age 6 (Grade 1)', sort_order: 2 },
        { code: 'AGE_7', label: 'Age 7 (Grade 2)', sort_order: 3 },
        { code: 'AGE_8', label: 'Age 8 (Grade 3)', sort_order: 4 },
        { code: 'AGE_9', label: 'Age 9 (Grade 4)', sort_order: 5 },
        { code: 'AGE_10', label: 'Age 10 (Grade 5)', sort_order: 6 },
        { code: 'AGE_11', label: 'Age 11 (Grade 6)', sort_order: 7 },
        { code: 'AGE_12', label: 'Age 12 (Grade 7)', sort_order: 8 },
        { code: 'AGE_13', label: 'Age 13 (Grade 8)', sort_order: 9 },
        { code: 'AGE_14', label: 'Age 14 (Grade 9)', sort_order: 10 },
        { code: 'AGE_15', label: 'Age 15 (Grade 10)', sort_order: 11 },
        { code: 'AGE_16', label: 'Age 16 (Grade 11)', sort_order: 12 },
        { code: 'AGE_17', label: 'Age 17 (Grade 12)', sort_order: 13 },
    ],

    dict_offering_roles: [
        { code: 'COMPULSORY', label: 'Compulsory', sort_order: 1 },
        { code: 'ELECTIVE', label: 'Elective', sort_order: 2 },
        { code: 'ADDITIONAL', label: 'Additional', sort_order: 3 },
        { code: 'ENRICHMENT', label: 'Enrichment', sort_order: 4 },
    ],

    dict_selection_groups: [
        { code: 'GROUP_A', label: 'Group A — Languages', sort_order: 1 },
        { code: 'GROUP_B', label: 'Group B — Sciences', sort_order: 2 },
        { code: 'GROUP_C', label: 'Group C — Commerce', sort_order: 3 },
        { code: 'GROUP_D', label: 'Group D — Humanities', sort_order: 4 },
        { code: 'GROUP_E', label: 'Group E — Creative Arts', sort_order: 5 },
        { code: 'GROUP_F', label: 'Group F — Technology', sort_order: 6 },
    ],

    dict_extracurricular_activities: [
        { code: 'SOCCER', label: 'Soccer', sort_order: 1 },
        { code: 'RUGBY', label: 'Rugby', sort_order: 2 },
        { code: 'CRICKET', label: 'Cricket', sort_order: 3 },
        { code: 'NETBALL', label: 'Netball', sort_order: 4 },
        { code: 'HOCKEY', label: 'Hockey', sort_order: 5 },
        { code: 'TENNIS', label: 'Tennis', sort_order: 6 },
        { code: 'SWIMMING', label: 'Swimming', sort_order: 7 },
        { code: 'ATHLETICS', label: 'Athletics', sort_order: 8 },
        { code: 'CHESS', label: 'Chess', sort_order: 9 },
        { code: 'DEBATE', label: 'Debate', sort_order: 10 },
        { code: 'DRAMA', label: 'Drama', sort_order: 11 },
        { code: 'MUSIC', label: 'Music', sort_order: 12 },
        { code: 'ART', label: 'Art', sort_order: 13 },
        { code: 'DANCE', label: 'Dance', sort_order: 14 },
        { code: 'CHOIR', label: 'Choir', sort_order: 15 },
        { code: 'CODING', label: 'Coding Club', sort_order: 16 },
        { code: 'ROBOTICS', label: 'Robotics', sort_order: 17 },
        { code: 'OTHER', label: 'Other', sort_order: 99 },
    ],

    dict_parent_types: [
        { code: 'BIOLOGICAL', label: 'Biological Parent', sort_order: 1 },
        { code: 'STEP', label: 'Step-Parent', sort_order: 2 },
        { code: 'ADOPTIVE', label: 'Adoptive Parent', sort_order: 3 },
        { code: 'FOSTER', label: 'Foster Parent', sort_order: 4 },
        { code: 'GUARDIAN', label: 'Legal Guardian', sort_order: 5 },
        { code: 'GRANDPARENT', label: 'Grandparent', sort_order: 6 },
        { code: 'RELATIVE', label: 'Other Relative', sort_order: 7 },
        { code: 'OTHER', label: 'Other', sort_order: 99 },
    ],

    dict_payment_options: [
        { code: 'MONTHLY', label: 'Monthly', sort_order: 1 },
        { code: 'QUARTERLY', label: 'Quarterly', sort_order: 2 },
        { code: 'BIANNUAL', label: 'Bi-Annual', sort_order: 3 },
        { code: 'ANNUAL', label: 'Annual (upfront)', sort_order: 4 },
        { code: 'DEBIT_ORDER', label: 'Debit Order', sort_order: 5 },
    ],

    dict_employment_types: [
        { code: 'PERMANENT', label: 'Permanent', sort_order: 1 },
        { code: 'CONTRACT', label: 'Contract', sort_order: 2 },
        { code: 'TEMPORARY', label: 'Temporary', sort_order: 3 },
        { code: 'PART_TIME', label: 'Part-Time', sort_order: 4 },
        { code: 'INTERN', label: 'Intern / Student Teacher', sort_order: 5 },
        { code: 'VOLUNTEER', label: 'Volunteer', sort_order: 6 },
    ],
};
