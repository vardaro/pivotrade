# Position

## About

The `Position` object is the object that gets passed to your strategy callback function, representing all open positions tied to your session.

## Reference

### Structure

The `Position` object does have constructor in case you may decide to create your own instances.

```javascript
position = {
    id = "",

    quantity = 0,

    limit = 0.0,
    
    close_price = 0.0,
    
    stop_loss = 0.0,
    
    type = "",

    cost_basis = 0.0,

    open_time = "",

    risk = 0.0,
    
    realized_pl = 0,
    
    unrealized_pl = 0,
}
```