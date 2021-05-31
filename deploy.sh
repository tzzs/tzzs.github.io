path="/webdata/"
log="/webdata/log/blog_page.log"

exec 1>>$log
exec 2>>$log

date "+%Y-%m-%d %H:%M:%S"

rm -rf $path"public"
cd $path
git clone git@e.coding.net:imtzz/Pages.git public
