import os
import sys
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
from datetime import datetime
import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import tensorflow as tf
import keras
import pytz
import requests
import tempfile
from pymongo import MongoClient
from pymongo.cursor import CursorType
def use_period(first_use):
    KST = pytz.timezone('Asia/Seoul')
    cur_time = datetime.now(KST)
    cur_time = np.datetime64(cur_time)
    period_use = (cur_time - first_use.index[0])
    use_day = period_use // np.timedelta64(1,'D')
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
'''
def create_time_steps(length):
    return list(range(-length, 0))
def show_plot(plot_data, delta, title):
    labels = ['History', 'True Future', 'Model Prediction']
    marker = ['.-', 'rx', 'go']
    time_steps = create_time_steps(plot_data[0].shape[0])
    if delta:
        future = delta
    else:
        future = 0

    plt.title(title)
    for i, x in enumerate(plot_data):
        if i:
            plt.plot(future, plot_data[i], marker[i], markersize=10, label = labels[i])
        else:
            plt.plot(time_steps, plot_data[i].flatten(), marker[i], label=labels[i])
    plt.legend()
    plt.xlim([time_steps[0], (future+5)*2])
    plt.xlabel('Time-Step')
    return plt
def baseline(history):
    return np.mean(history)
'''
if __name__ == '__main__':
    mpl.rcParams['figure.figsize'] = (8, 6)
    mpl.rcParams['axes.grid'] = False
    cur = sys.argv[1]
    cur_list = list(cur)
    time_cond_list = cur_list[0:1].copy()
    df = pd.DataFrame(cur_list)
    time_cond_df = pd.DataFrame(time_cond_list)
    df['time'] = pd.to_datetime(df['time'],unit = 's')
    df.set_index("time", inplace=True)
    time_cond_df['time'] = pd.to_datetime(time_cond_df['time'],unit = 's')
    time_cond_df.set_index("time", inplace=True)
    use_day = use_period(time_cond_df)
    if use_day < 1: #7
        print("error")
        sys.exit(exitcode)
    df = sampling_ten_mnt(df)
    if df.shape[0] < 1: #300
        print("error")
        sys.exit(exitcode)
    TRAIN_SPLIT = df.shape[0]
    tf.random.set_seed(5)
    uni_data = pd.DataFrame(df['current_temp', 'setting_temp'])
    #uni_data["ev_temp"] = uni_data["T (degC)"]
    uni_data["current_temp"] = uni_data["current_temp"].values.astype("float64")
    uni_data["setting_temp"] = uni_data["setting_temp"].values.astype("float64")
    #uni_data.plot(subplots=True)
    uni_data = uni_data.values
    uni_train_mean = uni_data[:TRAIN_SPLIT].mean()
    uni_train_std = uni_data[:TRAIN_SPLIT].std()
    uni_data = (uni_data - uni_train_mean) / uni_train_std
    univariate_past_history = 10
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
    with tempfile.TemporaryDirectory() as tmpdir:
        simple_lstm_model.save('d.h5')
        files = {'file' : open('d.h5', 'rb')}
        url = 'http://220.149.244.199:3001/app_list/test'
        #data = {"temper" : '22.3', "hum" : '5.5'}
        r = requests.post(url, files = files)
