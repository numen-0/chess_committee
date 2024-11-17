#!/bin/sh

set -eu

dataset="${1:-small}"
clearn_zip=true
ZIP=./archive.zip
OUT=./data.csv

echo "Preparing dataset: $dataset"

if [ "$dataset" = "small" ]; then
    IN=./games.csv
    echo "donwloading data"
    curl -L -o $ZIP \
        https://www.kaggle.com/api/v1/datasets/download/datasnaek/chess

    echo "undziping"
    time unzip -o $ZIP

    echo "transforming data"
    time cut -d , -f13 $IN > $OUT
    rm $IN
elif [ "$dataset" = "big" ]; then
    IN=./chess_games.csv
    echo "donwloading data"
    curl -L -o $ZIP \
        https://www.kaggle.com/api/v1/datasets/download/arevel/chess-games
    echo "undziping"
    time unzip -o $ZIP

    echo "transforming data"
    mv -v $IN $OUT
    time sed -i -e '1s/.*/moves/' \
                -e "s/.*,//" \
                -e '/{/d' \
                -e "s/[0-9]\+\. //g" \
                -e "s/\r//g" \
                -e "s/ \(0-1\|1-0\|1\/2-1\/2\)$//" $OUT
else
    echo "Unknown dataset name '$dataset'. Expected 'small' or 'big'." >&2
    exit 1
fi

[ $clearn_zip = true ] && rm -v $ZIP

echo "done"
