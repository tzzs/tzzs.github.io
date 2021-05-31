path="/webdata/"
log_path="/webdata/log/"
log="/webdata/log/blog_page.log"

if [ ! -d "$path" ]; then
    mkdir $path
fi

if [ ! -d "$log_path" ]; then
    mkdir $log_path
fi

touch $log

exec 1>>$log
exec 2>>$log

date "+%Y-%m-%d %H:%M:%S"

rm -rf $path"public"
cd $path
git clone git@e.coding.net:imtzz/Pages.git public
