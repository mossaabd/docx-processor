from server import process_document

# Test the processing of a single file
def test_single_file():
    file_path = "Connectivites.Immunologie.docx"  # Replace with your file name
    
    try:
        with open(file_path, 'rb') as file:
            print(f"Processing file: {file_path}")
            result = process_document(file)
            
            # Save the processed file
            output_path = "processed_" + file_path
            with open(output_path, 'wb') as output_file:
                output_file.write(result.getvalue())
            
            print(f"Successfully processed! Output saved as: {output_path}")
            
    except Exception as e:
        print(f"Error processing file: {str(e)}")

if __name__ == "__main__":
    test_single_file() 