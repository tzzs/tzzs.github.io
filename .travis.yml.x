language: node_js

node_js:
    - 12

before_install:
    - export TZ='Asia/Shanghai'
    - npm install hexo-cli --save
    - npm install --save
    - npm ls --depth 0

install:
    - echo "Happly Every Day."

before_script:
    - ls -a
    - hexo clean
    - hexo g

script:
    - git config user.name "tzzs"
    - git config user.email "1789803837@qq.com"
    - git config --global user.name "tzzs"
    - git config --global user.email "1789803837@qq.com"

    # - sed -i "s/Token1/${GithubToken}/g" ./_config.yml
    # - sed -i "s/Token2/${CodingToken}/g" ./_config.yml

    # - hexo deploy
    - ls -a
    - cd ./public
    - head -n 10 index.html
    - git init
    - git add .
    - git commit -m "Travis CI Auto Builder at `date +"%Y-%m-%d %H:%M"`"
    - git push --force "https://${GithubToken}@${GH_REF}" master:master
    - git push --force "https://${CodingToken}@${Coding}" master:master

deploy:
    - ls

branches:
    only:
        - hexo

env:
    global:
        - GH_REF: github.com/tzzs/tzzs.github.io.git
        - Coding: e.coding.net/imtzz/Pages.git
        - secure: G2JCdEoKPXvHQ/djaGie2Hm6YkH/VUa52U908k49YGj/wGzjFhoWEB6Bz7NY5OJGcb2ayBRwdORUxxc+AsksWP7iWUOMW3PTfk0CZ7CBgsXpW4hDxNTFzurMLNh9V2aSP1y7QrbgtwABpE2IryyJzjSFlUqmFRcWuOUMcr46bq6RW6mocFAbCRz6CBjOg8meK7tc8esPawY/8/trshwb4bv0WHrcMBQHuzAIc0L4L15G6cu2xpx7R2//OmY3dCw59Fv/2rcZ/CMC/wUVWroU6yiHAu26bosyAGykGMkuSqze8eR565s6lH5pCtBwVkj3YmDrJHUXtbcW1hSWYyPcGE408UY487ZvXvhFkMid05HpG4za3QRn8ntA1s9b5ihFQik+dR9XuAkyMPzdWslrAfoeOExrnrT2dT2EcYKPRZRKbiRs73cYqf2cCtmJQGx4fRqg2vx7P6YmLgI244iv0SOKlWd9CuhMq3waui/gTLvVL8O08UJiN9MkmVGlQ/stctChW0pM9gUFYL35+QtKfxuu8ACaIXRFkpNO0a6WjdNdGHvu2gm6vsad1hx6HaCazA61pRf8eMV4IafSOI3JZJKyCgMxNGbN0mL2bwL7BVujJxTMd2Z3pPksQsxtrnTTx/wiRWeP6O2VOodBsJHYMCyxlv+X6GSw7rzP3MY455U=
