import pandas as pd
from datetime import datetime

def allowed_file(filename, allowed_extensions):
    """Check if the file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def get_file_extension(file_path):
    """Get the file extension from a file path"""
    return file_path.rsplit('.', 1)[1].lower() if '.' in file_path else None

def load_and_clean_dataframe(file_path):
    """
    Load a CSV or Excel file, clean and validate the data
    Returns: cleaned dataframe, validation messages (if any)
    """
    # Determine file type
    file_ext = get_file_extension(file_path)
    
    try:
        # Load file based on extension
        if file_ext == 'csv':
            df = pd.read_csv(file_path)
        elif file_ext in ['xlsx', 'xls']:
            df = pd.read_excel(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
        
        # Normalize column names (lowercase, strip whitespace)
        df.columns = [col.lower().strip() for col in df.columns]
        
        # Check required columns
        required_columns = ['date', 'revenue', 'product']
        missing_columns = [col for col in required_columns if col not in df.columns]
        
        if missing_columns:
            raise ValueError(f"Missing required columns: {', '.join(missing_columns)}. Please ensure your file contains: {', '.join(required_columns)}")
        
        # Drop rows with missing values in key columns
        rows_before = len(df)
        df = df.dropna(subset=required_columns)
        rows_dropped_missing = rows_before - len(df)
        
        # Parse dates correctly with explicit format first
        # Try common formats in order of preference
        date_formats = [
            '%Y-%m-%d',      # ISO format: 2023-01-31
            '%m/%d/%Y',      # US format: 01/31/2023
            '%d/%m/%Y',      # UK/EU format: 31/01/2023
            '%d-%m-%Y',      # UK/EU with dashes: 31-01-2023
            '%m-%d-%Y',      # US with dashes: 01-31-2023
            '%d.%m.%Y',      # European with dots: 31.01.2023
        ]
        
        # Try each format and use the first one that works for the majority of entries
        date_format_used = None
        success_rates = {}
        
        # First attempt - try each format
        for date_format in date_formats:
            try:
                # Convert to datetime with specific format
                test_dates = pd.to_datetime(df['date'], format=date_format, errors='coerce')
                # Calculate success rate (% of non-NaT values)
                success_rate = 1.0 - (test_dates.isna().sum() / len(test_dates))
                success_rates[date_format] = success_rate
                
                # If format works for more than 90% of entries, use it
                if success_rate > 0.9:
                    date_format_used = date_format
                    df['date'] = test_dates
                    break
            except:
                continue
        
        # If no format worked well, fall back to pandas inference
        if date_format_used is None:
            df['date'] = pd.to_datetime(df['date'], errors='coerce')
            date_format_used = 'auto-detected'
        
        # Drop rows with invalid dates
        rows_before = len(df)
        df = df.dropna(subset=['date'])
        rows_dropped_date = rows_before - len(df)
        
        # Ensure revenue is numeric
        df['revenue'] = pd.to_numeric(df['revenue'], errors='coerce')
        rows_before = len(df)
        df = df.dropna(subset=['revenue'])
        rows_dropped_revenue = rows_before - len(df)
        
        # Return the cleaned dataframe and validation messages
        validation_messages = []
        
        # Add date format information
        format_examples = {
            '%Y-%m-%d': 'YYYY-MM-DD (2023-01-31)',
            '%m/%d/%Y': 'MM/DD/YYYY (01/31/2023)',
            '%d/%m/%Y': 'DD/MM/YYYY (31/01/2023)',
            '%d-%m-%Y': 'DD-MM-YYYY (31-01-2023)',
            '%m-%d-%Y': 'MM-DD-YYYY (01-31-2023)',
            '%d.%m.%Y': 'DD.MM.YYYY (31.01.2023)',
            'auto-detected': 'various formats'
        }
        
        if date_format_used in format_examples:
            validation_messages.append(f"Date format detected: {format_examples[date_format_used]}")
        
        if rows_dropped_missing > 0:
            validation_messages.append(f"Dropped {rows_dropped_missing} rows with missing values")
        if rows_dropped_date > 0:
            validation_messages.append(f"Dropped {rows_dropped_date} rows with invalid dates")
        if rows_dropped_revenue > 0:
            validation_messages.append(f"Dropped {rows_dropped_revenue} rows with invalid revenue values")
            
        return df, validation_messages
        
    except Exception as e:
        raise ValueError(f"Error processing file: {str(e)}")

def get_csv_preview(file_path, num_rows=5):
    """Return a preview of the first few rows of the CSV file"""
    try:
        # Load and clean the dataframe first
        df, _ = load_and_clean_dataframe(file_path)
        preview = df.head(num_rows).to_dict('records')
        
        # Format dates for display
        for row in preview:
            if isinstance(row.get('date'), pd.Timestamp):
                row['date'] = row['date'].strftime('%Y-%m-%d')
                
        return preview
    except Exception as e:
        raise ValueError(f"Error generating preview: {str(e)}") 