import ReactDOM from 'react-dom';
import {
    HashRouter,
    Route,
} from 'react-router-dom';

import './index.less';
import Test from './component';

ReactDOM.render(
    (
        <HashRouter>
            <div>
                <Route path="/" component={Test} />
            </div>
        </HashRouter >
    ), document.getElementById('app'),
);
