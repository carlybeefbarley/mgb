#!/bin/bash

# this file will download and install

#sourcing - setup paths
function addToPath(){
    new_entry=$1
    case ":$PATH:" in
    *":$new_entry:"*) :;; # already there
    *) PATH="$new_entry:$PATH";; # or PATH="$PATH:$new_entry"
    esac
}
if [ "$0" == "/bin/bash" ]; then
    #sourcing...
    WD=`pwd`/atools
    addToPath $WD/cordova/node_modules/cordova/bin
    addToPath $WD/ant/bin
    addToPath $WD/jdk/bin
    addToPath $WD/android/tools
    addToPath $WD/android/platform-tools
    addToPath `echo $WD/android/build-tools/*`

    export JAVA_HOME=$WD/jdk
    echo "-> PATH has been set up: $WD"
    return
fi


JDK="http://download.oracle.com/otn-pub/java/jdk/8u131-b11/d54c1d3a095b4ff2b6607d096fa80163/jdk-8u131-linux-x64.tar.gz"
#JDK="http://download.oracle.com/otn-pub/java/jdk/8u121-b13/e9e7ea248e2c4826b92b3f075a80e441/jdk-8u121-linux-x64.tar.gz"
#JDK="http://download.oracle.com/otn-pub/java/jdk/8u31-b13/jdk-8u31-linux-x64.tar.gz"

ANT="http://www.apache.org/dist/ant/binaries/apache-ant-1.10.1-bin.tar.bz2"
# ANT="http://www.apache.org/dist/ant/binaries/apache-ant-1.9.4-bin.tar.bz2"

ANDROID="http://dl.google.com/android/android-sdk_r24.0.2-linux.tgz"

CROSSWALK="https://download.01.org/crosswalk/releases/crosswalk/android/stable/11.40.277.7/crosswalk-11.40.277.7.zip"


WD=`dirname $0`/atools
mkdir -p $WD
WD=`cd ${WD}; pwd`

addToPath $WD/cordova/node_modules/cordova/bin
addToPath $WD/ant/bin
addToPath $WD/jdk/bin
addToPath $WD/android/tools
addToPath $WD/android/platform-tools
addToPath `echo $WD/android/build-tools/*`

export PATH=$PATH

echo $PATH
export JAVA_HOME=$WD/jdk



if [ "$1" == "" ]; then
	echo "working in: $WD"
	me=`basename $0`
	echo "usage:"
	echo -e ". ./$me - set up PATH"
	echo -e "$me install - downloads all packages and installs"
	echo -e "$me extract - extract downloaded packages - good if you need to reinstall all packages"
	echo -e "$me check - prints version for all tools"
	echo -e "$me make package manifest arch"
	echo -e "\t package - format: com.mydomain.myapp"
	echo -e "\t manifest - manifest.json"
	echo -e "\t arch - arm or x86"
	echo -e "\t keystore - keystore location"
	echo -e "$me keystore CN OU O L ST C - create new keystore"
	echo -e "\t  CN - common name"
	echo -e "\t  OU - organization unit"
	echo -e "\t  O - organization"
	echo -e "\t  L - location"
	echo -e "\t  ST - state"
	echo -e "\t  C - Contry code"

	echo ""
fi


function check(){
	java -fullversion
	ant -version
	python --version
	adb version
}

function extract(){
	if [ "$2" == "jdk" ] || [ "$2" == "" ]; then
		echo "extracting JDK"
		mkdir -p "${WD}/jdk"
		tar -xf "${WD}/"jdk.tar.gz --strip-components=1 -C "${WD}/"jdk
	fi

	if [ "$2" == "ant" ] || [ "$2" == "" ]; then
		echo "extracting ANT"
		mkdir -p "${WD}/ant"
		tar -xf "${WD}/"ant.tar.gz --strip-components=1 -C "${WD}/"ant
	fi



	if [ "$2" == "android" ] || [ "$2" == "" ]; then
		echo "extracting android"
		mkdir -p "${WD}/android"
		tar -xf "${WD}/"android.tar.gz --strip-components=1 -C "${WD}/"android
		cd "${WD}/"android
		tools/android update sdk --no-ui
		cd "${WD}"
	fi


	# if [ "$2" == "crosswalk" ] || [ "$2" == "" ]; then
	# 	echo "extracting crosswalk"
	# 	unzip "${WD}/"crosswalk.zip
	# 	mv "${WD}/"crosswalk-* "${WD}/"crosswalk
	# fi


	# if [ "$2" == "cordova" ] || [ "$2" == "" ]; then
	# 	echo "getting cordova"

	# 	mkdir -p "${WD}/cordova"
	# 	cd "${WD}/"cordova

	# 	npm install cordova
	# 	cd "${WD}"
	# fi

}

function install(){
  download $@
  extract $@

  check
}

function download(){

	mkdir -p "$WD"

	if [ "$2" == "jdk" ] || [ "$2" == "" ]; then
		# get JDK
		if [ -d jdk ]; then
			rm -rf jdk
		fi

		echo "FROM: ${JDK}"

		curl -L -b "oraclelicense=a" "$JDK" -o "${WD}/"jdk.tar.gz "$JDK"
		#curl -k -H "Cookie: oraclelicense=accept-securebackup-cookie" -o "${WD}/"jdk.tar.gz "$JDK"

		#wget --no-check-certificate --no-cookies --header "Cookie: oraclelicense=accept-securebackup-cookie" -O "${WD}/"jdk.tar.gz $JDK
	fi

	if [ "$2" == "ant" ] || [ "$2" == "" ]; then
		#get ANT
		if [ -d ant ]; then
			rm -rf ant
		fi
		curl -o "${WD}/"ant.tar.gz $ANT
		# wget -O "${WD}/"ant.tar.gz $ANT
	fi

	# if [ "$2" == "crosswalk" ] || [ "$2" == "" ]; then
	# 	#get crosswalk
	# 	if [ -d crosswalk ]; then
	# 		rm -rf crosswalk
	# 	fi
	# 	wget -O "${WD}/"crosswalk.zip $CROSSWALK
	# fi

	if [ "$2" == "android" ] || [ "$2" == "" ]; then
		#get android JDK
		if [ -d android ]; then
			rm -rf android
		fi
		curl -o "${WD}/"android.tar.gz $ANDROID
		# wget -O "${WD}/"android.tar.gz $ANDROID
	fi


	exit 0
}

function crosswalk(){

	echo "PACK $1"

	pack=$1
	man=$2
	arch=$3
	build=$4
	key=$5

	if [ "$man" == "" ]; then
		man=`pwd`"/manifest.json"
	fi

	mkdir -p $build
	rm -rf $build/*
	cd $build

	if [ -f "$man" ]; then
		echo ""
	else
		man=`pwd`"/../"$man
	fi

	python "${WD}/"crosswalk/make_apk.py --package=$pack --manifest=$man --arch=$arch -f --keep-screen-on --enable-remote-debugging

	ret=$?;
	if [ $ret -eq 0 ]; then
		if [ -f $key ]; then
			sign $key;
		fi
	else
		exit $ret
	fi
}

function cordova_init(){
	pack=$1
	name=$2

	echo "cordova init "$pack $name
	cordova create "$pack" "$pack" "$name"
	echo $pack

	cd $pack
	cordova platforms add android
	cordova platforms add ios
	cordova platforms add windows
	cd ../
}

function cordova_run(){
	pack=$1
	name=$2
	path=$3
	config=$4
	key=$5

	startdir=`pwd`
	out="MainActivity-debug.apk"

	if [ ! -d "$pack" ]; then
		cordova_init $pack $name
	fi

	echo "moving good sources..."$path "$pack/www"
	rm -rf "$pack/www/"*

	cp -a "$path/"* "$pack/www"
	cp -av "$path/config.xml" "$pack"

	release="";
	if [ "$key" != "" ]; then
		release="--release";
		out="MainActivity-release-unsigned.apk"
	fi

	cd $pack
	cordova build $release android > /dev/null

	cd "platforms/android/ant-build"

	mv "$out" "$startdir/$name.apk"

	cd $startdir;
	# cordova build android
	if [ -f $key ]; then
		sign $key;
	fi

	echo "HERE: "`pwd`

	echo "mv $startdir/$name.apk $startdir/$pack/"
	mv "$startdir/$name.apk" "$startdir/$pack/"
}


function sign(){
	echo "signing APK";
	key=$1

	storepass=$PASSWORD
	keypass=$PASSWORD
	alias="keystore_alias"

	if [ ! -f $key ]; then
		echo "Failed to locate keystore"
		return 1;
	fi
	if [ "$key" == "" ]; then
		echo "Keystore is not provided"
		return 1;
	fi
	#guess apk - as crosswalk lacks of apk name option - or its broken

	apk=`ls *.apk`

	echo "APK:"$apk;

	filename=$(basename "$apk")
	extension="${filename##*.}"
	filename="${filename%.*}"

	rm -f "$filename-tmp.apk"

	cp $filename.apk $filename-tmp.apk
	rm -rf $filename-signed.apk

	zip -d "$filename-tmp.apk" "META-INF*"

	#echo jarsigner  -verbose -tsa http://timestamp.digicert.com -sigalg SHA1withRSA -digestalg SHA1 -keystore $key -storepass $storepass -keypass $keypass "$filename-tmp.apk" $alias
	jarsigner  -verbose -tsa https://timestamp.geotrust.com/tsa -sigalg SHA1withRSA -digestalg SHA1 -keystore $key -storepass $storepass -keypass $keypass "$filename-tmp.apk" $alias
	${WD}/android/build-tools/*/zipalign -f 4 $filename-tmp.apk $filename.apk

	rm -rf "$filename-tmp.apk"
}


function keystore(){
	keystore="keystore"
	storepass=$PASSWORD
	alias="keystore_alias"
	rm -f $keystore

	keytool \
		-genkeypair \
		-validity 36500 \
		-dname "CN=$1,
				OU=$2,
				O=$3,
				L=$4,
				S=$5,
				C=$6" \
		-keystore $keystore \
		-storepass $storepass \
		-keypass $storepass \
		-alias $alias \
		-keyalg RSA
}


case "$1" in
	"install")
		install $@
		;;
	"extract")
		extract $@
		;;
	"check")
		check
		;;
	"sign")
		sign $2
		;;
	"keystore")
		shift;
		keystore $@
		;;
	"crosswalk")
		shift;
		crosswalk $@
		;;
	"cordova_init")
		shift;
		cordova_init $@
		;;
	"cordova")
		shift;
		cordova_run $@
		;;
	"path")
		echo $PATH
		;;
esac
