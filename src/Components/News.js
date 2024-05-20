import React, { useEffect, useState } from 'react';
import NewsItem from './NewsItem';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import Spinner from './Spinner';
import { Button } from 'react-bootstrap';

const News = (props) => {
    const [articles, setArticles] = useState([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [totalResults, setTotalResults] = useState(0)
    const [showToTopButton, setShowToTopButton] = useState(false);
    
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const updateNews = async () => {
        props.setProgress(10);
        const url = `https://newsapi.org/v2/top-headlines?country=${props.country}&category=${props.category}&apiKey=${props.apiKey}&page=${page}&pageSize=${props.pageSize}`;
        setLoading(true);
        let data = await fetch(url);
        props.setProgress(30);
        let fetchedData = await data.json();
        props.setProgress(70);
        setArticles(prevArticles => page === 1 ? fetchedData.articles : [...prevArticles, ...fetchedData.articles]);
        setTotalResults(fetchedData.totalResults)
        setLoading(false)
        props.setProgress(100);
    }
    
    const handleScroll = () => {
        const scrollPosition = window.scrollY;
        const scrollThreshold = 400;
        if (scrollPosition > scrollThreshold) {
            setShowToTopButton(true)
        } else {
            setShowToTopButton(false)
        }
    };
    
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };
    
    useEffect(() => {
        document.title = `${capitalizeFirstLetter(props.category)} - NewsBuddy`;
        updateNews()
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        }
        // eslint-disable-next-line
    },[])

    const fetchMoreData = async () => {
        const url = `https://newsapi.org/v2/top-headlines?country=${props.country}&category=${props.category}&apiKey=${props.apiKey}&page=${page+1}&pageSize=${props.pageSize}`;
        setPage(page + 1);
        let data = await fetch(url);
        let fetchedData = await data.json();
        setArticles(articles.concat(fetchedData.articles))
        setTotalResults(fetchedData.totalResults)
    };

    return (
        <>
            <div className="container" style={{ marginTop: '90px' }}>
                <h1 className='text-center'>NewsBuddy - Top <strong>{capitalizeFirstLetter(props.category)}</strong> Headlines</h1>
                {loading && <Spinner />}
                <InfiniteScroll
                    dataLength={articles.length}
                    next={fetchMoreData}
                    hasMore={articles.length !== totalResults}
                    loader={<Spinner />}
                >
                    <div className="container">
                        <div className="row my-3">
                            {articles.map((element, index) => (
                                <div className="col-md-4" key={element.url + index}>
                                    <NewsItem
                                        title={element.title ? element.title : ''}
                                        description={element.description ? element.description : ''}
                                        imageURL={element.urlToImage ? element.urlToImage : ''}
                                        url={element.url}
                                        author={element.author}
                                        date={element.publishedAt}
                                        source={element.source.name}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </InfiniteScroll>
                {showToTopButton && (
                    <Button variant="primary" onClick={scrollToTop} style={styles.toTopButton}>
                        &uarr;
                    </Button>
                )}
            </div>
        </>
    );
}

const styles = {
    toTopButton: {
        position: 'fixed',
        bottom: '20px',
        right: '20px'
    }
};
News.defaultProps = {
    country: 'us',
    pageSize: 8,
    category: 'general',
}

News.propTypes = {
    country: PropTypes.string,
    pageSize: PropTypes.number,
    category: PropTypes.string,
    apiKey: PropTypes.string.isRequired,
    setProgress: PropTypes.func.isRequired,
}

export default News