import Base from '../Base';

import get from './get';
import login from './login';
import auto_create from './auto_create';
import update from './update';
import current_user from './current_user';
import send_email from './send_email';
import send_reg_email from './send_reg_email';
import send_confirm_email from './send_confirm_email';
import check_email from './check_email';
import check_username from './check_username';
import change_password from './change_password';
import forgot_password from './forgot_password';
import reset_password from './reset_password';
import list_users from './list_users';
import list_refer from './list_refer';
import test from './test';
import resetPublicKey from './reset_public_key';
import send_backup_key from './send_backup_key';

export default Base.setRouter([
////////////////NUMBERS//////////////////////////
{
    path : '/login',
    router : login,
    method : 'post'
},
/////////////////////////////////////////////////
    {
        path : '/login',
        router : login,
        method : 'post'
    },
    {
        path : '/reset_public_key',
        router : resetPublicKey,
        method : 'put'
    },
    {
        path : '/list_refer',
        router : list_refer,
        method : 'get'
    },
    {
        path : '/auto-create',
        router : auto_create,
        method : 'post'
    },
    {
        path : '/:userId',
        router : update,
        method : 'put'
    },
    {
        path : '/public/:userId',
        router : get,
        method : 'get'
    },
    {
        path : '/send-email',
        router : send_email,
        method : 'post'
    },
    {
        path : '/send-code',
        router : send_reg_email,
        method : 'post'
    },
    {
        path: '/send-confirm',
        router: send_confirm_email,
        method: 'post'
    },
    {
        path: '/send-backup-key',
        router: send_backup_key,
        method: 'post'
    },
    {
        path: '/check-email',
        router: check_email,
        method: 'post'
    },
    {
        path: '/check-username',
        router: check_username,
        method: 'post'
    },
    {
        path : '/current_user',
        router : current_user,
        method : 'get'
    },
    {
        path : '/change_password',
        router : change_password,
        method : 'get'
    },
    {
        path : '/forgot-password',
        router : forgot_password,
        method : 'post'
    },
    {
        path : '/reset-password',
        router : reset_password,
        method : 'post'
    },
    {
        path : '/:userIds/users',
        router : list_users,
        method : 'get'
    },
    {
        path : '/list',
        router : list_users,
        method : 'get'
    },
    // TEST
    {
        path : '/test',
        router : test,
        method : 'post'
    }
]);
