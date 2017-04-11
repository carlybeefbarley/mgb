export QT_QPA_PLATFORM=''
java -jar ~/bin/selenium-* > /dev/null &

for i in `seq 1 $1`
do
  echo "Running "$i" of "$1
  mocha # > /dev/null
done

