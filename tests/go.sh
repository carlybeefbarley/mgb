export TEST_USER=kasparsstauzs1
export TEST_KEY=Bz7NKqjsmsLdsESGeN3y

# run webdriver tests
#wdio

# run nightwatch tests in parallel @browserstack - also google for magellan - as it possibly will allow for easier config
nightwatch -e edge_latest,XP_chrome_46,ELCapitan_Safari_9.1,WIN8.1_ff_3.6,IE6

#run local tests
#nightwatch -e local
