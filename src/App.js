import './app.css';
import { useEffect, useState } from 'react';

function App() {
  const [menuData, setMenuData] = useState(null);

  useEffect(() => {
    getData()
      .then(data => setMenuData(data))
      .catch(e => console.log(e))
  }, []);

  const getData = async () => {
    try {
      const response = await fetch('https://my.qnips.io/dbapi/ha', {
        method: 'GET',
        body: null,
        headers: {
          'Content-type': 'application/json'
        }
      });

      const data = await response.json();
      return data;

    } catch (e) {
      throw (e);
    }
  }

  const createTable = (data) => {
    const rows = data.Rows.map((row, index) => {

      const products = data.Rows[index].Days.map((item, i) => {
        if (i === item.Weekday) {

          const id = item.ProductIds[0].ProductId;

          for (let key in data.Products) {
            if (key == id) {
              const { Name, Price, AllergenIds } = data.Products[key];

              const allergensArr = Object.entries(data.Allergens).filter(item => {
                return AllergenIds.includes(item[1].Id);
              }).map((item, i, arr) => {
                if (item[1].Label && i < arr.length - 1) {
                  return `${item[1].Label}, `
                } else {
                  return item[1].Label;
                }
              });

              const price = Price.Betrag.toFixed(2);

              return (
                <td key={i}>
                  <p className='app__table-name'>{Name}</p>
                  <br />
                  <p className="app__table-allerg">{allergensArr}</p>
                  <p className="app__table-price">
                    <b>{price} €</b>
                  </p>
                </td>
              )
            }
          }
        }
      });

      return (
        <tr key={index}>
          <th scope='row'>{row.Name}</th>
          {products}
        </tr>
      )
    });

    return rows;
  }

  const createTableHeader = () => {
    const setOneMoreDay = (startDay) => {
      const nextDay = new Date(startDay);
      nextDay.setDate(startDay.getDate() + 1);

      return nextDay;
    }

    const dayToString = (day) => {
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      };
      return day.toLocaleDateString('de-DE', options);
    }

    const createDaysArr = () => {
      let arr = [];
      for (let i = 0; i < 5; i++) {

        if (i === 0) {
          arr.push(new Date(`2016-02-22`));
        } else {
          arr[i] = setOneMoreDay(arr[i - 1]);
        }
      }

      return arr;
    }
    createDaysArr();
    const createItems = () => {
      const arr = createDaysArr().map((item, i) => {
        item = dayToString(item);
        const dayName = item.match(/[A-Za-z]/gi).join('');
        const dayNum = item.replace(/[^0-9.]/g, '').replace(/(\d{1,2})\.(\d{1,2})\.(\d{4})/, function (match, day, month, year) {
          day = day.length === 1 ? '0' + day : day;
          month = month.length === 1 ? '0' + month : month;
          return `${day}.${month}.${year}`;
        });
        const dataTime = dayNum.replace(/(\d{1,2})\.(\d{1,2}).(\d{4})/, '$2-$1-$3');
        return (
          <th scope="col" key={i}>
            {dayName}
            <br />
            <time datatime={dataTime}>
              {dayNum}
            </time>
          </th>
        )
      });
      return arr;
    }

    const items = createItems();
    return items;
  };

  const items = menuData ? createTable(menuData) : null;
  const header = createTableHeader();

  return (
    <div className="app">
      <h1 className='visibility-hidden'>Der Speiseplan für eine Woche</h1>
      <div className="app__container">
        <table className='app__table'>
          <thead className='app__table-head'>
            <tr>
              <th scope="col">KW8</th>
              {header}
            </tr>
          </thead>
          <tbody>
            {items}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
