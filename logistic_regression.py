import os
import sys
from sklearn.linear_model import LogisticRegression
import pandas as pd
import numpy as np
from scipy.stats import norm
def data_creation():
    #mdx_data = pd.read_csv("F:/medex_algorithm/mdx_data.csv",sep=",",index_col=0, encoding="UTF-8")
    mdx_data = pd.read_csv(sys.argv[1],sep=",",index_col=0, encoding="UTF-8")
    mdx_data['satisf'] = mdx_data['satisf'].apply(lambda x: 0 if x < 4 else 1)
    mdx_data['snoring'] = mdx_data['snoring'].apply(lambda x: 1 if x < 1.5 else (2 if x < 2.5 else(3 if x < 3.5 else(4 if x < 4.5 else 5))))
    mdx_data['moving'] = mdx_data['moving'].apply(lambda x: 1 if x < 1.5 else (2 if x < 2.5 else(3 if x < 3.5 else(4 if x < 4.5 else 5))))
    mdx_data['sound'] = mdx_data['sound'].apply(lambda x: 1 if x < 1.5 else (2 if x < 2.5 else(3 if x < 3.5 else(4 if x < 4.5 else 5))))
    return mdx_data
def data_preprocessing(mdx_data):
    features = mdx_data[['snoring','moving','sound','bmi','stime']]
    sleep_satisf = mdx_data['satisf']
    test_satisf = pd.concat([sleep_satisf[10:299], sleep_satisf[937:1000]])
    train_satisf = sleep_satisf[98:978]
    test_features = pd.concat([features[10:299], features[937:1000]])
    train_features = features[98:978]
    return (test_satisf, train_satisf, test_features, train_features)
def model_training(mdx_data, train_features, train_satisf):
    model = LogisticRegression()
    model.fit(train_features, train_satisf)
    return model
def logit_pvalue(model, x):
    p1 = model.predict_proba(x)
    n1 = len(p1)
    m1 = len(model.coef_[0]) + 1
    coefs = np.concatenate([model.intercept_, model.coef_[0]])
    x_full = np.matrix(np.insert(np.array(x), 0, 1, axis = 1))
    answ = np.zeros((m1, m1))
    for i in range(n1):
        answ = answ + np.dot(np.transpose(x_full[i, :]), x_full[i, :]) * p1[i,1] * p1[i, 0]
    vcov = np.linalg.inv(np.matrix(answ))
    se = np.sqrt(np.diag(vcov))
    t1 =  coefs/se  
    p1 = (1 - norm.cdf(abs(t1))) * 2
    return p1
import statsmodels.api as sd
if __name__ == '__main__':
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    mdx_data = data_creation()
    test_satisf, train_satisf, test_features, train_features = data_preprocessing(mdx_data)
    model = model_training(mdx_data, train_features, train_satisf)


    pvalue = logit_pvalue(model,train_features)[1:6]
    coefficient = model.coef_
    test_idx = []
    test_coef = []
    for i in pvalue:
        if i < 0.05:
            test_coef.extend(coefficient[0,np.where(pvalue == i)][0])
            test_idx.extend(np.where(pvalue == i)[0])
    if len(test_idx) > 0:
        test_coef = list(map(abs,test_coef))
        list3 = list(zip(test_idx,test_coef))
        list3.sort(key = lambda x:x[1],reverse=True)
        list4 = []
        for i in list3:
            list4.extend(i[0:1])
        print(list4)
    else:
        print(-1)