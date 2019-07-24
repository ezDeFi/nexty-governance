import Base from '../Base';
import get_result from './get_result'

export default Base.setRouter([
    {
        path : '/get_result',
        router : get_result,
        method : 'get'
    },
]);