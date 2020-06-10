import z from 'zorium';
import * as _ from 'lodash-es';

class FormatService {
  constructor() {
    this.abbreviateDollar = this.abbreviateDollar.bind(this);
  }

  number(number) {
    // http://stackoverflow.com/a/2901298
    if (number != null) {
      return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
      return '...';
    }
  }
  // https://stackoverflow.com/a/32638472
  abbreviateNumber(value, fixed) {
    if (value == null) {
      return '...';
    }
    // terminate early
    if (value === 0) {
      return '0';
    }
    // terminate early
    fixed = !fixed || (fixed < 0) ? 0 : fixed;
    // valueber of decimal places to show
    const b = value.toPrecision(2).split('e');
    const k = b.length === 1 ? 0 : Math.floor(Math.min(b[1].slice(1), 14) / 3);
    const c = k < 1 ? value.toFixed(0 + fixed) : (value / Math.pow(10, (k * 3))).toFixed(1 + fixed);
    const d = c < 0 ? c : Math.abs(c);
    const e = d + [
      '',
      'K',
      'M',
      'B',
      'T'
    ][k];
    // append power
    return e;
  }

  abbreviateDollar(value, fixed) {
    return `$ ${this.abbreviateNumber(value, fixed)}`;
  }

  location(obj) {
    const {city, state} = obj || {};
    if (city && state) {
      return `${city}, ${state}`;
    } else if (state) {
      return state;
    } else if (obj) {
      return 'Unknown';
    } else {
      return '...';
    }
  }

  percentage(value) {
    return `${Math.round(value * 100)}%`;
  }

  centsToDollars(cents) {
    return (cents / 100).toFixed(2);
  }

  countdown(s) {
    let hours, prettyTimer;
    let seconds = Math.floor(s % 60);
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    const days = Math.floor(s / 86400);
    let minutes = Math.floor(s / 60) % 60;
    if (minutes < 10) {
      minutes = `0${minutes}`;
    }
    if (days > 2) {
      hours = Math.floor(s / 3600) % 24;
      if (hours < 10) {
        hours = `0${hours}`;
      }
      prettyTimer = `${days} days`;
    } else {
      hours = Math.floor(s / 3600);
      if (hours < 10) {
        hours = `0${hours}`;
      }
      prettyTimer = `${hours}:${minutes}:${seconds}`;
    }

    return prettyTimer;
  }

  arrayToSentence(arr) {
    return arr.join(', ').replace(/, ((?:.(?!, ))+)$/, ' and $1');
  }

  // [2015, 2016, 2017, 2019] -> "2015-2017, 2019"
  yearsArrayToEnglish(years) {
    const lastYear = 0;
    let isConsecutive = false;
    let str = '';
    years.forEach(function(year, i) {
      if ((years[i + 1] === (year + 1)) && !isConsecutive) {
        str += `${year}-`;
        return isConsecutive = true;
      } else if (!isConsecutive) {
        return str += `${year}, `;
      } else if (years[i + 1] !== (year + 1)) {
        str += `${year}, `;
        return isConsecutive = false;
      }
    });

    return str.slice(0, -2);
  }
}

export default new FormatService();
