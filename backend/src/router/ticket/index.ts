import Base from '../Base';
import add_ticket from './add_ticket'
import get_ticket from './get_ticket'
import update_ticket from './update_ticket'
import delete_ticket from './delete_ticket'

export default Base.setRouter([
    {
        path : '/add_ticket',
        router : add_ticket,
        method : 'post'
    },
    {
        path : '/get_ticket',
        router : get_ticket,
        method : 'get'
    },
    {
        path : '/update_ticket',
        router : update_ticket,
        method : 'put'
    },
    {
        path : '/delete_ticket',
        router : delete_ticket,
        method : 'delete'
    },
]);