#real code - learning
import os
import sys
from datetime import datetime
import numpy as np
import pandas as pd
import tensorflow as tf
import keras
import pytz
import tempfile
import requests, json
def use_period(df):
    use_day = df['s_day'].max()-df['s_day'].min()+1
    return use_day
def sampling_ten_mnt(df):
    resampled_df = df.resample(rule='10T').first()
    resampled_df = resampled_df.dropna(axis=0)
    return resampled_df

def multivariate_data(dataset, target, start_index, end_index, history_size, target_size, step, single_step=True):
    data = []
    labels = []
    start_index = start_index + history_size
    if end_index is None:
        end_index = len(dataset) - target_size

    for i in range(start_index, end_index):
        indices = range(i-history_size, i, step)
        data.append(dataset[indices])

        if single_step:
            labels.append(target[i+target_size])
        else:
            labels.append(target[i:i+target_size])
    return np.array(data), np.array(labels)

if __name__ == '__main__':
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    serial_num = sys.argv[1]
    data = {}
    data["serialnum"] = serial_num
    #request_data = 0
    url = 'http://220.149.236.48:3001/app_list/learn'
    request_data = requests.post(url, data=data)
    df =pd.DataFrame(request_data.json())
    df['time'] = pd.to_datetime(df['time'],unit = 'ms')
    df.set_index("time", inplace=True)
    use_day = use_period(df)
    if use_day >= 7:
        print("error")
        sys.exit()
    #df = sampling_ten_mnt(df)

    if df.shape[0] < 300:
        print("error")
        sys.exit()
    TRAIN_SPLIT = df.shape[0]
    tf.random.set_seed(5)
    uni_data = pd.DataFrame(df[['current_temp', 'setting_temp']])
    uni_data["current_temp"] = uni_data["current_temp"].values.astype("float64")
    uni_data["setting_temp"] = uni_data["setting_temp"].values.astype("float64")
    uni_data = uni_data.values
    uni_train_mean = uni_data[:TRAIN_SPLIT].mean()
    uni_train_std = uni_data[:TRAIN_SPLIT].std()
    uni_data = (uni_data - uni_train_mean) / uni_train_std
    n = 20 # buffer
    univariate_past_history = n
    univariate_future_target = 0
    STEP = 1
    x_train_uni, y_train_uni = multivariate_data(uni_data, uni_data[:,1],0, TRAIN_SPLIT,univariate_past_history, univariate_future_target,STEP)
    x_val_uni, y_val_uni = multivariate_data(uni_data,uni_data[:,1], (TRAIN_SPLIT//5) * 4, TRAIN_SPLIT, univariate_past_history, univariate_future_target,STEP)

    BATCH_SIZE = 256
    BUFFER_SIZE = 10
    train_univariate = tf.data.Dataset.from_tensor_slices((x_train_uni, y_train_uni))
    train_univariate = train_univariate.cache().shuffle(BUFFER_SIZE).batch(BATCH_SIZE).repeat()
    val_univariate = tf.data.Dataset.from_tensor_slices((x_val_uni, y_val_uni))
    val_univariate = val_univariate.batch(BATCH_SIZE).repeat()
    simple_lstm_model = tf.keras.models.Sequential([
        tf.keras.layers.LSTM(32, input_shape = x_train_uni.shape[-2:]),
        tf.keras.layers.Dense(1)
    ])
    simple_lstm_model.compile(optimizer='adam', loss='mae')
    EVALUATION_INTERVAL = 200
    EPOCHS = 20
    simple_lstm_model.fit(train_univariate, epochs = EPOCHS, steps_per_epoch=EVALUATION_INTERVAL, validation_data = val_univariate, validation_steps = 50)
    filename = serial_num + '.h5'
    #simple_lstm_model.save(filename)
    with tempfile.TemporaryDirectory() as tmpdir:
        simple_lstm_model.save(filename)
        files = {'file' : open(filename, 'rb')}
        url = 'http://220.149.236.48:3001/app_list/test'
        r = requests.post(url, files = files)
