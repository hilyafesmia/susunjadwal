import { takeLatest } from 'redux-saga';
import { LOCATION_CHANGE, push } from 'react-router-redux';
import { take, call, select, cancel, fork, put } from 'redux-saga/effects';
import { FETCH, SET_JADWAL_UTAMA, DELETE_JADWAL } from './constants';
import { isEmpty, isEqual } from 'lodash';
import selectGlobal from 'containers/App/selectors';
import selectJadwal from './selectors';
import { fetchDone, fetchPrimarySchedule } from './actions';
import request from 'utils/request';
import { loading, loadingDone } from 'containers/App/actions';
import { consolidateStreamedStyles } from 'styled-components';

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
          c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
      }
  }
  return "";
}

/**
 * Github repos request/response handler
 */
export function* fetchUserData() {
  yield put(loading());
  const user_id = getCookie("user_id");
  const token = getCookie("token");
  const requestURL = `http://localhost:5000/susunjadwal/api/users/${user_id}/user_schedules`;
  const auth = `Bearer ${token}`;

  const fetchUserDataCall = yield call(request, requestURL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: auth,
    },
  });

  if(!fetchUserDataCall.err || !(fetchUserDataCall.err === 'SyntaxError: Unexpected end of JSON input')) {
    let primaryScheduleID = '';

  	fetchUserDataCall.data.user_schedules.map((value, key) => {
      console.log(value.id)
  		if(value.utama) {
  			primaryScheduleID = value.id;
      }
      primaryScheduleID = value.id;
  	});
    console.log(primaryScheduleID)

  	const requestURLPrimarySched = `http://localhost:5000/susunjadwal/api/user_schedules/${primaryScheduleID}`;

  	const fetchPrimaryScheduleCall = yield call(request, requestURLPrimarySched, {
	    method: 'GET',
	    headers: {
	      Accept: 'application/json',
	      'Content-Type': 'application/json',
	    },
    });

    console.log(fetchPrimaryScheduleCall.data);

  	if(!fetchPrimaryScheduleCall.err || !(fetchPrimaryScheduleCall.err === 'SyntaxError: Unexpected end of JSON input')) {
  		yield put(fetchDone(fetchPrimaryScheduleCall.data.user_schedule, fetchUserDataCall.data.user_schedules));
      yield put(loadingDone());
  	} else {
  		console.log(fetchPrimaryScheduleCall.err);
      yield put(loadingDone());
  	}
  } else {
    console.log(saveJadwalPostCall.err);
    yield put(loadingDone());
  }
}

/**
 * Watches for LOAD_REPOS action and calls handler
 */
export function* fetchUserDataSaga() {
  yield takeLatest(FETCH, fetchUserData);
}

/**
 * DELETE_JADWAL handler
 */
export function* deleteJadwal(action) {
  yield put(loading());
  const globalState = yield select(selectGlobal());
  const user_id = getCookie("user_id");
  const token = getCookie("token");
  const requestURL = `http://localhost:5000/susunjadwal/api/users/${user_id}/user_schedules/${action.id}`;
  const auth = `Bearer ${token}`;

  const response = yield call(request, requestURL, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: auth,
    },
  });

  if(!(response.err) || !(response.err === 'SyntaxError: Unexpected end of JSON input')) {
    // TOOD: Handle refreshing after delete gracefully. See https://stackoverflow.com/questions/41769969/how-to-make-my-component-re-render-after-updating-props-from-selector-in-react-a
    window.location.reload();
  } else {
    console.log(response.err);
  }
  yield put(loadingDone());
}

/**
 * Watches for DELETE_JADWAL action and calls handler
 */
export function* deleteJadwalSaga() {
  yield takeLatest(DELETE_JADWAL, deleteJadwal);
}

/**
 * Github repos request/response handler
 */
export function* changePrimary(action) {
  yield put(loading());
	const globalState = yield select(selectGlobal());
  const requestURL = `http://localhost:5000/susunjadwal/api/users/${globalState.user_id}/user_schedules/${action.id}/set-utama`;
  const auth = `Bearer ${globalState.token}`;

  const changePrimaryCall = yield call(request, requestURL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: auth,
    },
    body: JSON.stringify({})
  });

  if(!changePrimaryCall.err || !(changePrimaryCall.err === 'SyntaxError: Unexpected end of JSON input')) {
  	const requestURLPrimarySched = `http://localhost:5000/susunjadwal/api/user_schedules/${action.id}`;

  	const fetchPrimaryScheduleCall = yield call(request, requestURLPrimarySched, {
	    method: 'GET',
	    headers: {
	      Accept: 'application/json',
	      'Content-Type': 'application/json',
	    },
	  });

  	if(!fetchPrimaryScheduleCall.err || !(fetchPrimaryScheduleCall.err === 'SyntaxError: Unexpected end of JSON input')) {
      yield put(fetchPrimarySchedule(fetchPrimaryScheduleCall.data.jadwals));
      // TOOD: Handle refreshing after delete gracefully. See https://stackoverflow.com/questions/41769969/how-to-make-my-component-re-render-after-updating-props-from-selector-in-react-a
      window.location.reload();
  	} else {
  		console.log(fetchPrimaryScheduleCall.err);
  	}
  } else {
    console.log(changePrimaryCall.err);
  }
  yield put(loadingDone());
}

/**
 * Watches for LOAD_REPOS action and calls handler
 */
export function* changePrimarySaga() {
  yield takeLatest(SET_JADWAL_UTAMA, changePrimary);
}

/**
 * Root saga manages watcher lifecycle
 */
export function* jadwalSaga() {
  // Fork watcher so we can continue execution
  const fetchUserDataWatcher = yield fork(fetchUserDataSaga);
  const changePrimaryWatcher = yield fork(changePrimarySaga);
  const deleteJadwalWatcher = yield fork(deleteJadwalSaga);
}

// Bootstrap sagas
export default [
 jadwalSaga,
];
