for i in `seq 1 $1`
do
  echo "Running "$i" of "$1
  mocha # > /dev/null
done

