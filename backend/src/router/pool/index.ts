import Base from '../Base';
import get_portal from './get_portal';

export default Base.setRouter([
    {
        path : '/get_portal',
        router : get_portal,
        method : 'get'
    }
]);
