import Base from '../Base';
import add_client from './add_client'
import save_default_client from './save_default_client'
import get_client from './get_client'
import update_client from './update_client'
import delete_client from './delete_client'

export default Base.setRouter([
    {
        path : '/add_client',
        router : add_client,
        method : 'post'
    },
    {
        path : '/save_default_client',
        router : save_default_client,
        method : 'put'
    },
    {
        path : '/get_client',
        router : get_client,
        method : 'get'
    },
    {
        path : '/update_client',
        router : update_client,
        method : 'put'
    },
    {
        path : '/delete_client',
        router : delete_client,
        method : 'delete'
    },
]);