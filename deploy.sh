path="/webdata/"
log_path="/webdata/log/"
log="/webdata/log/blog_page.log"

echo "start deployment"

if [ ! -d "$path" ]; then
    mkdir $path
fi

if [ ! -d "$log_path" ]; then
    mkdir $log_path
fi

echo "set log path"
touch $log

exec 1>>$log
exec 2>>$log

date "+%Y-%m-%d %H:%M:%S"

echo `date "+%Y-%m-%d %H:%M:%S"`

echo "delete public dir"
rm -rf $path"public"
cd $path

echo "clone pages code."
git clone git@e.coding.net:imtzz/Pages.git public
