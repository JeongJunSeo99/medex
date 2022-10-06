import os
import sys
from datetime import datetime
import numpy as np
import pandas as pd
import keras
import requests, json
if __name__ == '__main__':
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    model = keras.models.load_model(sys.argv[2])
    serial_num = sys.argv[1]
    data = {}
    data["serialnum"] = serial_num
    url = 'http://220.149.236.48:3001/app_list/rec'
    request_data = requests.post(url, data=data)
    df =pd.DataFrame(request_data.json())
    df['time'] = pd.to_datetime(df['time'],unit = 'ms')
    df.set_index("time", inplace=True)
    df = df.dropna(axis=0)
    uni_data = pd.DataFrame(df[['current_temp', 'setting_temp']])
    uni_data["current_temp"] = uni_data["current_temp"].values.astype("float64")
    uni_data["setting_temp"] = uni_data["setting_temp"].values.astype("float64")
    uni_data = uni_data.values
    uni_data_mean = uni_data.mean()
    uni_data_std = uni_data.std()
    uni_data = (uni_data-uni_data_mean)/uni_data_std
    n =20
    univariate_past_history = n
    univariate_future_target = 0
    x_uni_data = np.reshape(uni_data[0:n], (1,n,2))
    print(round(((model.predict(x_uni_data)[0][0])*uni_data_std + uni_data_mean)))
