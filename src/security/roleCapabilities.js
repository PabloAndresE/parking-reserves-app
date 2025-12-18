export const ROLE_CAPABILITIES = {
    user: {
        editPastDays: false,
        editOthers: false,
        openAdminModal: false
    },
    supervisor: {
        editPastDays: true,
        editOthers: true,
        openAdminModal: true
    },
    admin: {
        editPastDays: true,
        editOthers: true,
        openAdminModal: true
    }
};
